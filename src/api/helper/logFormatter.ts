import type { Log } from "../log";
import { LogLevel } from "../logLevel";

export const logFormatter = (
    log: Log.Entry[], level: LogLevel = LogLevel.INFO
): string => {
    let finalString = "";
    for (const logEntry of log) {
        // TODO: Handle log level
        const tempLogLevel = logEntry.level === undefined ? "INFO" : logEntry.level.toUpperCase();
        finalString += `${logEntry.time.toISOString()} [${tempLogLevel}] ${logEntry.creator}: ${logEntry.content}\n`;
    }
    return finalString;
};
