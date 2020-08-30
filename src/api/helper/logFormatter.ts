import type { Log } from "../log";
import { LogLevel } from "../logLevel";

const getSupportedLogLevels = (level: LogLevel = LogLevel.INFO) => {
    const supportedLogLevels = [LogLevel.ERROR];
    if (level === LogLevel.ERROR) {
        return supportedLogLevels;
    }
    supportedLogLevels.push(LogLevel.WARNING);
    if (level === LogLevel.WARNING) {
        return supportedLogLevels;
    }
    supportedLogLevels.push(LogLevel.INFO);
    if (level === LogLevel.INFO) {
        return supportedLogLevels;
    }
    supportedLogLevels.push(LogLevel.DEBUG);
    if (level === LogLevel.DEBUG) {
        return supportedLogLevels;
    }
    throw Error(`"Unknown log level: ${JSON.stringify(level)}`);
};

export const logFormatter = (
    log: Log.Entry[], level: LogLevel = LogLevel.INFO
): string => {
    let finalString = "";
    const supportedLogLevels = getSupportedLogLevels(level);
    for (const logEntry of log) {
        const tempLogLevel = logEntry.level === undefined ? LogLevel.INFO : logEntry.level;
        if (supportedLogLevels.includes(tempLogLevel)) {
            finalString += `${logEntry.time.toISOString()} [${tempLogLevel.toUpperCase()}] ${logEntry.creator}: ${
                logEntry.content}\n`;
        }
    }
    return finalString;
};
