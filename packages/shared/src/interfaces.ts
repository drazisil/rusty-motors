import { SerializedBufferOld } from "rusty-motors-shared";

/**
 * @module interfaces
 */

export const name = "interfaces";

/**
 * @exports
 * @interface
 */

export interface DatabaseManager {
    updateSessionKey: (
        arg0: number,
        arg1: string,
        arg2: string,
        arg3: string,
    ) => Promise<void>;
    fetchSessionKeyByCustomerId: (arg0: number) => Promise<SessionKeys>;
}

/**
 * @exports
 */
export interface ConnectionRecord {
    customerId: number;
    connectionId: string;
    sessionKey: string;
    sKey: string;
    contextId: string;
}

interface SessionKeys {
    sessionKey: string;
    sKey: string;
}

export interface GameMessageOpCode {
    name: string;
    value: number;
    module: "Lobby" | "Login";
}

export interface PersonaRecord {
    customerId: number;
    id: Buffer;
    maxPersonas: Buffer;
    name: Buffer;
    personaCount: Buffer;
    shardId: Buffer;
}

export interface UserRecordMini {
    contextId: string;
    customerId: number;
    userId: number;
}

/**
 * @exports
 */
export interface RaceLobbyRecord {
    lobbyId: number;
    raceTypeId: number;
    turfId: number;
    riffName: string;
    eTurfName: string;
}

export interface ServiceArgs {
    connectionId: string;
    message: SerializedBufferOld;
    log: import("pino").Logger;
}

export interface KeypressEvent {
    sequence: string;
    name: string;
    ctrl: boolean;
    meta: boolean;
    shift: boolean;
}