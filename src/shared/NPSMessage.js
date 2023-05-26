import { Sentry } from "mcos/shared";

/**
 * @module mcos-shared
 */

/**
 * @property {number} msgNo
 * @property {number} msgVersion
 * @property {number} reserved
 * @property {Buffer} content
 * @property {number} msgLength
 * @property {"sent" | "received"} direction
 * @property {string} serviceName
 */
export class NPSMessage {
    /** @type {number} */
    msgNo;
    /** @type {number} */
    msgVersion;
    /** @type {number} */
    reserved;
    /** @type {Buffer} */
    content;
    /** @type {number} */
    msgLength;
    /** @type {"sent" | "received"} */
    direction;
    /** @type {string} */
    serviceName;
    /**
     *
     * @param {"sent" | "received"} direction - the direction of the message flow
     */
    constructor(direction) {
        this.direction = direction;
        this.msgNo = 0;
        this.msgVersion = 0;
        this.reserved = 0;
        this.content = Buffer.alloc(0);
        this.msgLength = 0;
        this.serviceName = "NPSMessage-SHELL";
    }

    /**
     *
     * @param {Buffer} buffer
     */
    setContent(buffer) {
        this.content = buffer;
        this.msgLength = this.content.length + 12; // skipcq: JS-0377
    }

    /**
     *
     * @return {string}
     */
    getPacketAsString() {
        return this.serialize().toString("hex");
    }

    /**
     *
     * @return {Buffer}
     */
    serialize() {
        try {
            const packet = Buffer.alloc(this.msgLength);
            packet.writeInt16BE(this.msgNo, 0);
            packet.writeInt16BE(this.msgLength, 2);
            if (this.msgLength > 4) {
                packet.writeInt16BE(this.msgVersion, 4);
                packet.writeInt16BE(this.reserved, 6);
            }

            if (this.msgLength > 8) {
                packet.writeInt32BE(this.msgLength, 8);
                this.content.copy(packet, 12);
            }

            return packet;
        } catch (error) {
            if (error instanceof Error) {
                const err = new TypeError(
                    `[NPSMsg] Error in serialize(): ${error.message}`
                );
                Sentry.addBreadcrumb({ level: "error", message: err.message });
                throw err;
            }
            const err = new Error(
                "[NPSMsg] Error in serialize(), error unknown"
            );
            Sentry.addBreadcrumb({ level: "error", message: err.message });
            throw err;
        }
    }

    /**
     *
     * @param {Buffer} packet
     * @return {NPSMessage}
     * @memberof NPSMessage
     */
    deserialize(packet) {
        this.msgNo = packet.readInt16BE(0);
        this.msgLength = packet.readInt16BE(2);
        this.msgVersion = packet.readInt16BE(4);
        this.content = packet.subarray(12);
        return this;
    }

    /**
     *
     * @param {string} messageType
     * @return {string}
     */
    dumpPacketHeader(messageType) {
        return `NPSMsg/${messageType},
              ${JSON.stringify({
                  direction: this.direction,
                  msgNo: this.msgNo.toString(16),
                  msgVersion: this.msgVersion,
                  msgLength: this.msgLength,
              })}`;
    }

    /**
     * DumpPacket
     * @return {string}
     * @memberof NPSMessage
     */
    dumpPacket() {
        return `NPSMsg/NPSMsg,
              ${JSON.stringify({
                  direction: this.direction,
                  msgNo: this.msgNo.toString(16),
                  msgVersion: this.msgVersion,
                  msgLength: this.msgLength,
                  content: this.content.toString("hex"),
                  serialized: this.serialize().toString("hex"),
              })}`;
    }

    /**
     *
     * @return {TNPSMessageJSON}
     */
    toJSON() {
        return {
            msgNo: this.msgNo,
            contextId: "",
            msgLength: this.msgLength,
            msgVersion: this.msgVersion,
            content: this.content.toString("hex"),
            direction: this.direction,
            rawBuffer: this.content.toString("hex"),
            opCode: 0,
            sessionKey: "",
        };
    }
}