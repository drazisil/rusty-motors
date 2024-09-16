import { type Logger, type LoggerOptions, pino } from "pino";

type ServerLoggerOptions = {
    level?: string;
    module?: string;
    name?: string;
};

/**
 * @static
 * @property {ServerLogger} instance
 */
export class ServerLogger {
    logger: Logger;
    static instance: ServerLogger | undefined;
    /**
     * Creates an instance of ServerLogger.
     * @param {ServerLoggerOptions} options
     */
    constructor(options: ServerLoggerOptions) {
        this.logger = pino(options);
        this.logger.level = options.level ?? "info";
        ServerLogger.instance = this;
    }

    /**
     * @param {string} message
     */
    fatal(message: string) {
        this.logger.fatal(message);
    }

    /**
     * @param {string} message
     */
    error(message: string) {
        this.logger.error(message);
    }

    /**
     * @param {string} message
     */
    warn(message: string) {
        this.logger.warn(message);
    }

    /**
     * @param {string} message
     */
    info(message: string) {
        this.logger.info(message);
    }

    /**
     * @param {string} message
     */
    debug(message: string) {
        this.logger.debug(message);
    }

    /**
     * @param {string} message
     */
    trace(message: string) {
        this.logger.trace(message);
    }

    /**
     * @global
     * @external pino
     * @see {@link https://www.npmjs.com/package/pino}
     */

    /**
     * @param {module:pino.LoggerOptions} _options
     * @returns {module:pino.Logger}
     */
    child(_options: LoggerOptions): Logger {
        const child = this.logger;
        return child;
    }
}

/**
 * Get a logger instance
 *
 * @param {ServerLoggerOptions} options
 * @return {module:pino.Logger}
 */
export function getServerLogger(options: ServerLoggerOptions): Logger {
    const logLevel = process.env['MCO_LOG_LEVEL'] ?? "info";
    const moduleName = options && options.module ? options.module : "unknown";
    if (typeof ServerLogger.instance === "undefined") {
        ServerLogger.instance = new ServerLogger({
            name: "mcos",
            level: logLevel, // This isn't used by the logger, but it's used by the constructor
            module: moduleName,
        });
    }

    const child = ServerLogger.instance.child(options);
    child.level = logLevel;
    return child;
}
