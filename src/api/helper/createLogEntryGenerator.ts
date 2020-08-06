import { Log } from "../log";
import { LogLevel } from "../logLevel";

export const createLogEntryGenerator = (debuglog: (msg: string, ... param: any[]) => void, debugName: string) => {
    return (content: string, logLevel?: LogLevel): Log.Entry => {
        debuglog(content);
        return {
            content,
            creator: debugName,
            level: logLevel !== undefined ? logLevel : LogLevel.INFO,
            time: new Date()
        };
    };
};
