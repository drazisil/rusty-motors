import type { Socket } from "node:net";
import { ServerMessage } from "../../shared-packets";
import { getServerMessageProcessor } from "../../mcots";
import type { TServerLogger } from "../../shared";
import * as Sentry from "@sentry/node";
import { getDatabase } from "../../database";
import { key as keySchema } from "../../../schema/key";
import { eq } from "drizzle-orm";

// mcos is a game server, written from scratch, for an old game
// Copyright (C) <2017>  <Drazi Crendraven>
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as published
// by the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

import { createCipheriv, createDecipheriv, getCiphers } from "node:crypto";
import { McosEncryptionPair } from "../../shared";

/**
 * This function creates a new encryption pair for use with the game server
 *
 * @param {string} key The key to use for encryption
 * @returns {McosEncryptionPair} The encryption pair
 */
export function createCommandEncryptionPair(key: string): McosEncryptionPair {
    if (key.length < 16) {
        throw Error(`Key too short: ${key}`);
    }

    const sKey = key.slice(0, 16);

    // Deepcode ignore HardcodedSecret: This uses an empty IV
    const desIV = Buffer.alloc(8);

    const gsCipher = createCipheriv("des-cbc", Buffer.from(sKey, "hex"), desIV);
    gsCipher.setAutoPadding(false);

    const gsDecipher = createDecipheriv(
        "des-cbc",
        Buffer.from(sKey, "hex"),
        desIV,
    );
    gsDecipher.setAutoPadding(false);

    return new McosEncryptionPair(gsCipher, gsDecipher);
}

/**
 * This function creates a new encryption pair for use with the database server
 *
 * @param {string} key The key to use for encryption
 * @returns {McosEncryptionPair} The encryption pair
 * @throws Error if the key is too short
 */
export function createDataEncryptionPair(key: string): McosEncryptionPair {
    if (key.length < 16) {
        throw Error(`Key too short: ${key}`);
    }

    const stringKey = Buffer.from(key, "hex");

    // File deepcode ignore InsecureCipher: RC4 is the encryption algorithum used here, file deepcode ignore HardcodedSecret: A blank IV is used here
    const tsCipher = createCipheriv("rc4", stringKey.subarray(0, 16), "");
    const tsDecipher = createDecipheriv("rc4", stringKey.subarray(0, 16), "");

    return new McosEncryptionPair(tsCipher, tsDecipher);
}

/**
 * This function checks if the server supports the legacy ciphers
 *
 * @returns void
 * @throws Error if the server does not support the legacy ciphers
 */
export function verifyLegacyCipherSupport() {
    const cipherList = getCiphers();
    if (!cipherList.includes("des-cbc")) {
        throw Error("DES-CBC cipher not available");
    }
    if (!cipherList.includes("rc4")) {
        throw Error("RC4 cipher not available");
    }
}

export class Connection {
    private _socket: Socket;
    private _connectionId: string;
    private _logger: TServerLogger;
    private _personaId: number | null = null;
    private _cipherPair: McosEncryptionPair | null = null;

    constructor(socket: Socket, connectionId: string, logger: TServerLogger) {
        this._socket = socket;
        this._connectionId = connectionId;
        this._logger = logger;

        this._socket.on("data", (data) => this.handleSocketData(data));
        this._socket.on("error", (error) => this.handleSocketError(error));
        this._socket.on("close", () => this.close());

        this._logger.debug(`Connection ${this._connectionId} created`);
    }
    private async _getCiperKeyFromDatabase() {
        this._logger.setName("Connection:_getCiperKeyFromDatabase");
        if (this._cipherPair !== null) {
            return;
        }

        if (typeof this._personaId !== "number") {
            this._logger.error(
                `Tried to get cipher key from database without a persona ID`,
            );
            throw new Error(
                `Tried to get cipher key from database without a persona ID`,
            );
        }

        // Get the cipher key from the database
        const session_key = await getDatabase()
            .select()
            .from(keySchema)
            .where(eq(keySchema.userId, this._personaId))
            .then((rows) => {
                if (rows.length !== 1) {
                    this._logger.error(
                        `Error getting cipher key from database for persona ID ${this._personaId}`,
                    );
                    throw new Error(
                        `Error getting cipher key from database for persona ID ${this._personaId}`,
                    );
                }

                return rows[0]!.sessionKey;
            });

        // Set the cipher key
        this._cipherPair = createDataEncryptionPair(session_key);

        this._logger.debug(
            `Got cipher key from database for persona ID ${this._personaId}`,
        );

        this._logger.resetName();
    }
    handleSocketData(data: Buffer): void {
        this._logger.setName("Connection:handleSocketData");
        try {
            const message = new ServerMessage(0).deserialize(data);
            this.processMessage(message);
        } catch (error) {
            this._logger.error(
                `Error handling socket data for connectionId ${this._connectionId}: ${error as string}`,
            );
            Sentry.captureException(error);
        }
        this._logger.resetName();
    }

    processMessage(message: ServerMessage) {
        this._logger.setName("Connection:processMessage");
        if (message.isEncrypted() && this._cipherPair === null) {
            this._getCiperKeyFromDatabase().catch((error) => {
                this._logger.error(
                    `Error getting cipher key from database for persona ID ${this._personaId}: ${error as string}`,
                );
                Sentry.captureException(error);
            });
        }

        this._logger.debug(`Raw message: ${message.toHexString()}`);

        message = this.decryptIfNecessary(message);

        // Lookup the message processor
        const processor = getServerMessageProcessor(message.getId());

        if (processor === undefined) {
            this._logger.error(
                `No message processor found for message ID ${message.getId()}`,
            );
            return;
        }

        // Process the message
        processor(
            this._connectionId,
            message,
            this.sendMessage.bind(this),
        ).catch((error) => {
            this._logger.error(
                `Error processing message for connectionId ${this._connectionId}: ${error as string}`,
            );
            Sentry.captureException(error);
        });

        this._logger.resetName();
    }

    sendMessage(messages: ServerMessage[]) {
        this._logger.setName("Connection:sendMessage");
        this._logger.debug(
            `Sending ${messages.length} messages for connection ${this._connectionId}`,
        );
        try {
            messages.forEach((message) => {
                this._logger.debug(`Sending message ID ${message.getId()}`);
                this._logger.debug(`Message: ${message.toHexString()}`);
                this._socket.write(message.serialize());
            });
        } catch (error) {
            this._logger.error(
                `Error sending message for connectionId ${this._connectionId}: ${error as string}`,
            );
            Sentry.captureException(error);
        }

        this._logger.debug(`Sent messages for connection ${this._connectionId}`);

        this._logger.resetName();
    }

    close() {
        this._socket.end(() => {
            this._logger.debug(`Connection ${this._connectionId} closed`);
            this._socket.destroy();
        });
    }

    handleSocketError(error: NodeJS.ErrnoException) {
        this._logger.setName("Connection:handleSocketError");
        if (error.code === "ECONNRESET") {
            this._logger.debug(`Connection ${this._connectionId} reset`);
            return;
        }
        this._logger.error(
            `Socket error: ${error.message} on connection ${this._connectionId}`,
        );
        Sentry.captureException(error);
        this.close();
        this._logger.resetName();
    }

    decryptIfNecessary(message: ServerMessage): ServerMessage {
        this._logger.setName("Connection:decryptIfNecessary");
        if (message.isEncrypted()) {
            if (this._cipherPair === null) {
                this._logger.error(
                    `Message is encrypted but no cipher pair is available for connection ${this._connectionId}`,
                );
                throw new Error(
                    `Message is encrypted but no cipher pair is available for connection ${this._connectionId}`,
                );
            }
            message.decrypt(this._cipherPair);
            this._logger.debug(
                `Decrypted message: message ID ${message.getId()}, prior messsage ID ${message.getPreDecryptedMessageId()}`,
            );
        }
        this._logger.resetName();
        return message;
    }
}