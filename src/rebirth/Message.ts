import { get } from "http";
import { MessageHeader } from "./MessageHeader.js";
import { ISerializedObject, SerializerBase } from "./SerializerBase.js";

export class Message extends SerializerBase implements ISerializedObject {
    toFrom: number;
    appID: number;
    _header: null | MessageHeader;
    get header(): MessageHeader {
        if (!this._header) {
            throw new Error("Message.Header: header is null");
        }
        return this._header;
    }
    sequence: number;
    flags: number;
    buffer: Buffer;

    constructor() {
        super();
        this.toFrom = 0;
        this.appID = 0;

        /** @type {MessageHeader | null} */
        this._header = null;

        this.sequence = 0;
        this.flags = 0;
        this.buffer = Buffer.alloc(0);
    }
    serializeSize(): number {
        throw new Error("Method not implemented.");
    }

    /**
     *
     * @param {Message} sourceNode
     * @returns {Message}
     */
    static from(sourceNode: Message): Message {
        const node = new Message();
        node.toFrom = sourceNode.toFrom;
        node.sequence = sourceNode.sequence;
        node.flags = sourceNode.flags;
        node._header = sourceNode._header;
        node.buffer = sourceNode.buffer;
        return node;
    }
    serialize(): Buffer {
        let buf = Buffer.alloc(0);
        if (!this._header) {
            throw new Error("Message.serialize: header is null");
        }

        buf = Buffer.concat([buf, this._header.serialize()]);
        buf = Buffer.concat([
            buf,
            SerializerBase._serializeWord(this.sequence),
        ]);
        buf = Buffer.concat([buf, SerializerBase._serializeByte(this.flags)]);
        buf = Buffer.concat([buf, this.buffer]);
        return buf;
    }

    /**
     * Deserialize the MessageNode from a buffer.
     * @param {Buffer} buf
     * @returns {Message}
     */
    static deserialize(buf: Buffer): Message {
        const node = new Message();
        node._header = MessageHeader.deserialize(buf.subarray(0, 6));
        node.sequence = SerializerBase._deserializeWord(buf.subarray(6, 8));
        node.flags = SerializerBase._deserializeByte(buf.subarray(10, 11));
        node.buffer = buf.subarray(11);
        return node;
    }

    toString(): string {
        return `Message: header=${this.header}, sequence=${this.sequence}, flags=${this.flags}, buffer=${this.buffer.toString("hex")}"}`;
    }
}