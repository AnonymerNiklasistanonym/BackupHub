import { createLogEntryGenerator } from "./createLogEntryGenerator";
import { debuglog } from "util";
import { directoryExists } from "./fileExists";
import { promises as fs } from "fs";
import { Log } from "../log";
import { LogLevel } from "../logLevel";


const debug = debuglog("app-helper-checkAndCreateBackupDir");
const createLogEntry = createLogEntryGenerator(debug, "Helper:CheckAndCreateBackupDir");

export interface CheckAndCreateBackupDirOptions {
    cwd?: string
    dryRun?: boolean
}

export const checkAndCreateBackupDir = async (
    backupDir: string, options: CheckAndCreateBackupDirOptions = {}
): Promise<{exists: boolean; logs: Log.Entry[]}> => {
    const logs: Log.Entry[] = [];
    if (!await directoryExists(backupDir)) {
        logs.push(createLogEntry(`Directory was not found: "${backupDir}"`, LogLevel.WARNING));
        try {
            logs.push(createLogEntry(`Try to create the directory: "${backupDir}"`, LogLevel.INFO));
            if (!options.dryRun) {
                await fs.mkdir(backupDir, { recursive: true });
                if (await directoryExists(backupDir)) {
                    logs.push(createLogEntry(`The directory "${backupDir}" was created`, LogLevel.INFO));
                } else {
                    logs.push(createLogEntry(`The directory "${backupDir}" could not be created`, LogLevel.WARNING));
                    return { exists: false, logs };
                }
            }
        } catch (err) {
            logs.push(createLogEntry(`The directory "${backupDir}" could not be created`, LogLevel.WARNING));
            return { exists: false, logs };
        }
    } else {
        logs.push(createLogEntry(`Directory was found: "${backupDir}"`));
    }
    return { exists: true, logs };
};
