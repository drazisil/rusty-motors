/// <reference types="node" />
/**
 * Packet container for NPS messages
 * @module NPSMsg
 */
/**
 *
 * @export
 * @typedef {Object} INPSMessageJSON
 * @property {number} msgNo
 * @property {number | undefined} opCode
 * @property {number} msgLength
 * @property {number} msgVersion
 * @property {string} content
 * @property {string} contextId
 * @property {EMessageDirection} direction
 * @property {string | undefined } sessionkey
 * @property {string} rawBuffer
 */
/**
 * @class
 * @property {number} msgNo
 * @property {number} msgVersion
 * @property {number} reserved
 * @property {Buffer} content
 * @property {number} msgLength
 * @property {MESSAGE_DIRECTION} direction
 */
export class NPSMessage {
    /**
     *
     * @param {EMessageDirection} direction - the direction of the message flow
     */
    constructor(direction: any);
    /** @type {number} */
    msgNo: number;
    /** @type {number} */
    msgVersion: number;
    /** @type {number} */
    reserved: number;
    /** @type {Buffer} */
    content: Buffer;
    /** @type {number} */
    msgLength: number;
    /** @type {EMessageDirection} */
    direction: any;
    serviceName: string;
    /**
     *
     * @param {Buffer} buffer
     */
    setContent(buffer: Buffer): void;
    /**
     *
     * @return {Buffer}
     */
    getContentAsBuffer(): Buffer;
    /**
     *
     * @return {string}
     */
    getPacketAsString(): string;
    /**
     *
     * @return {Buffer}
     */
    serialize(): Buffer;
    /**
     *
     * @param {Buffer} packet
     * @return {NPSMessage}
     */
    deserialize(packet: Buffer): NPSMessage;
    /**
     *
     * @param {string} messageType
     * @returns {string}
     */
    dumpPacketHeader(messageType: string): string;
    /**
     * DumpPacket
     * @return {string}
     */
    dumpPacket(): string;
    /**
     *
     * @return {INPSMessageJSON}
     */
    toJSON(): INPSMessageJSON;
}
export type INPSMessageJSON = {
    msgNo: number;
    opCode: number | undefined;
    msgLength: number;
    msgVersion: number;
    content: string;
    contextId: string;
    direction: any;
    sessionkey: string | undefined;
    rawBuffer: string;
};
import { Buffer } from "buffer";
