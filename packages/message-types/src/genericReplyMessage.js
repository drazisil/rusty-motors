// WORD  msgNo;    // typically MC_SUCCESS or MC_FAILURE
// WORD  msgReply; // message # being replied to (ex: MC_PURCHASE_STOCK_CAR)
// DWORD result; // specific to the message sent, often the reason for a failure
// DWORD data;   // specific to the message sent (but usually 0)
// DWORD data2;

export class GenericReplyMessage {
    /** @type {number} */
    msgNo;
    /** @type {number} */
    toFrom;
    /** @type {number} */
    appId;
    /** @type {number} */
    msgReply;
    /** @type {Buffer} */
    result;
    /** @type {Buffer} */
    data;
    /** @type {Buffer} */
    data2;
    /**
     *
     */
    constructor() {
      this.msgNo = 0;
      this.toFrom = 0;
      this.appId = 0;
      this.msgReply = 0;
      this.result = Buffer.alloc(4);
      this.data = Buffer.alloc(4);
      this.data2 = Buffer.alloc(4);
    }
  
    /**
     * Setter data
     * @param {Buffer} value
     */
    setData(value) {
      this.data = value;
    }
  
    /**
     * Setter data2
     * @param {Buffer} value
     */
    setData2(value) {
      this.data2 = value;
    }
  
    /**
     *
     * @param {Buffer} buffer
     */
    deserialize(buffer) {
      try {
        this.msgNo = buffer.readInt16LE(0);
      } catch (error) {
        if (error instanceof RangeError) {
          // This is likeley not an MCOTS packet, ignore
        } else {
          throw new TypeError(
            `[GenericReplyMsg] Unable to read msgNo from ${buffer.toString(
              "hex"
            )}: ${String(error)}`
          );
        }
      }
  
      this.msgReply = buffer.readInt16LE(2);
      this.result = buffer.slice(4, 8);
      this.data = buffer.slice(8, 12);
      this.data2 = buffer.slice(12);
    }
  
    serialize() {
      const packet = Buffer.alloc(16);
      packet.writeInt16LE(this.msgNo, 0);
      packet.writeInt16LE(this.msgReply, 2);
      this.result.copy(packet, 4);
      this.data.copy(packet, 8);
      this.data2.copy(packet, 12);
      return packet;
    }
  
    /**
     *
     * @param {Buffer} buffer
     */
    setResult(buffer) {
      this.result = buffer;
    }
  
    /**
     * DumpPacket
     * @return {string}
     */
    dumpPacket() {
      return `GenericReply',
        ${JSON.stringify({
          msgNo: this.msgNo,
          msgReply: this.msgReply,
          result: this.result.toString("hex"),
          data: this.data.toString("hex"),
          tdata2: this.data2.toString("hex"),
        })}`;
    }
  }