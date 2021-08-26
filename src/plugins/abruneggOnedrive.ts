import {
    commandCanBeFound, createLogEntryGenerator, createVersionStringPlugin,
    runShellCommand
} from "../api/helper";
import type { Log, Plugin } from "../api/backupHub";
import type { AbruneggOneDrive } from "./abruneggOneDrive/types";
export type { AbruneggOneDrive } from "./abruneggOneDrive/types";
import { debuglog } from "util";
import { LogLevel } from "../api/logLevel";
import { PluginError } from "../api/error";


export const pluginName = "AbruneggOneDrive";
export const pluginVersionNumbers: Plugin.Info.Version = {
    major: 1
};
export const pluginVersion = createVersionStringPlugin(pluginVersionNumbers);
export enum AbruneggOneDriveCommand {
    SYNCHRONIZE = "SYNCHRONIZE",
    CUSTOM = "CUSTOM"
}
export const shellCommand = "onedrive";


const debug = debuglog("app-plugin-abruneggOneDrive");
const createLogEntry = createLogEntryGenerator(debug, pluginName);


const abruneggOneDrivePlugin: Plugin = {
    name: pluginName,
    routines: {
        // eslint-disable-next-line complexity
        runInstruction: async (options, instruction): Promise<Plugin.Output> => {
            const logs: Log.Entry[] = [];
            const abruneggOneDriveInstruction = instruction as AbruneggOneDrive.Instruction;

            const cliOptions: string[] = [];
            if (abruneggOneDriveInstruction.command === AbruneggOneDriveCommand.CUSTOM) {
                // Set nothing
            } else if (abruneggOneDriveInstruction.command === AbruneggOneDriveCommand.SYNCHRONIZE) {
                cliOptions.push("--synchronize");
                // Set nothing
            }

            if (abruneggOneDriveInstruction.options.verbose === true) {
                cliOptions.push("--verbose");
            }
            if (abruneggOneDriveInstruction.options.verbose === true) {
                cliOptions.push("--download");
            }

            const output = await runShellCommand(shellCommand, cliOptions, {
                dryRun: options.job.dryRun
            });
            logs.push(... output.logs);

            return { log: logs };
        },
        setup: async (): Promise<Plugin.Output> => {
            const logs: Log.Entry[] = [];

            try {
                if (await commandCanBeFound(shellCommand)) {
                    logs.push(createLogEntry(`The '${shellCommand}' command was found`,
                        LogLevel.DEBUG));
                } else {
                    logs.push(createLogEntry(`The '${shellCommand}' command was not found`,
                        LogLevel.ERROR));
                    throw Error(`The '${shellCommand}' command was not found`);
                }
            } catch (err) {
                const pluginError: PluginError = {
                    ... err as Error, pluginName, pluginVersion
                };
                pluginError.message = `Plugin ${pluginName}: ${pluginError.message}`;
                const errLogs = (err as PluginError)?.logs;
                pluginError.logs = errLogs !== undefined ? logs.concat(errLogs) : logs;
                pluginError.logs.push(createLogEntry(pluginError.message, LogLevel.ERROR));
                throw pluginError;
            }

            return { log: logs };
        }
    },
    version: pluginVersion,
    versionNumbers: { ... pluginVersionNumbers }
};

export default abruneggOneDrivePlugin;
