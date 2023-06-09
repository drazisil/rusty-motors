import { Socket } from "node:net";

export class Connection {
    /**
     * @memberof Connection
     */
    static INACTIVE = 0;

    /**
     * @memberof Connection
     */
    static ACTIVE = 1;

    /**
     * @memberof Connection
     */
    static CLOSE_PENDING = 2;

    /**
     * @memberof Connection
     */
    static SOFT_KILL = 3;
    id: number;
    appID: number;
    status: number;
    socket: Socket | null = null;
    port: number;
    useEncryption: boolean;
    encryprion: null;
    ip: string;

    constructor() {
        this.id = 0;
        this.appID = 0;
        this.status = Connection.INACTIVE;
        this.socket = null;
        this.port = 0;
        this.useEncryption = false;
        this.encryprion = null;
        this.ip = "";
    }

}