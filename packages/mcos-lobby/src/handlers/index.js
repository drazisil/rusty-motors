import { handleEncryptedNPSCommand } from "./encryptedCommand.js";
import { _npsHeartbeat } from "./heartbeat.js";
import { _npsRequestGameConnectServer } from "./requestConnectGameServer.js";

/**
 * @global
 * @typedef {object} MessageHandler
 * @property {number} opCode
 * @property {string} name
 * @property {(dataConnection: import("../../../mcos-gateway/src/sockets.js").BufferWithConnection) => Promise<import("../../../mcos-gateway/src/sockets.js").GSMessageArrayWithConnection>} handlerFunction
 */

/** @type {MessageHandler[]} */
export const handlerMap = [
    {
        opCode: 100,
        name: "Connect game server",
        handlerFunction: _npsRequestGameConnectServer,
    },
    { opCode: 217, name: "Heartbeat", handlerFunction: _npsHeartbeat },
    {
        opCode: 1101,
        name: "Encrypted command",
        handlerFunction: handleEncryptedNPSCommand,
    },
];