import {
    commandCanBeFound, createLogEntryGenerator, createVersionStringPlugin,
    directoryExists, runShellCommand
} from "../api/helper";
import type { Log, Plugin } from "../api/backupHub";
import { debuglog } from "util";
import type { Grive } from "./grive/types";
export type { Grive } from "./grive/types";
import { LogLevel } from "../api/logLevel";
import { PluginError } from "../api/error";
import { resolveVariableString } from "../api/helper/resolveVariableString";


export const pluginName = "Grive";
export const pluginVersionNumbers: Plugin.Info.Version = {
    major: 1
};
export const pluginVersion = createVersionStringPlugin(pluginVersionNumbers);
export enum GriveCommand {
    SYNCHRONIZE = "SYNCHRONIZE",
    CUSTOM = "CUSTOM"
}
export const shellCommand = "grive";


const debug = debuglog("app-plugin-grive");
const createLogEntry = createLogEntryGenerator(debug, pluginName);


const grivePlugin: Plugin = {
    name: pluginName,
    routines: {
        // eslint-disable-next-line complexity
        runInstruction: async (options, instruction): Promise<Plugin.Output> => {
            const logs: Log.Entry[] = [];
            const griveInstruction = instruction as Grive.Instruction;

            try {

                const cliOptions: string[] = [];
                if (griveInstruction.command === GriveCommand.CUSTOM) {
                    // Set nothing
                } else if (griveInstruction.command === GriveCommand.SYNCHRONIZE) {
                    // Nothing special right now
                }
                if (griveInstruction.options.progressBar === true) {
                    cliOptions.push("--progress-bar");
                }
                if (griveInstruction.options.verbose === true) {
                    cliOptions.push("--verbose");
                }

                const googleDriveDir = resolveVariableString(options.globals.variables,
                    griveInstruction.options.googleDriveDir);
                if (Array.isArray(googleDriveDir)) {
                    const errorMessage = `Google Drive directory (${
                        griveInstruction.options.googleDriveDir}) resolved to more than one path:\n${
                        JSON.stringify(googleDriveDir)}`;
                    logs.push(createLogEntry(errorMessage, LogLevel.ERROR));
                    throw Error(errorMessage);
                }

                // Check if each backup directory exists or can be created
                if (!await directoryExists(googleDriveDir)) {
                    const errorMessage = `Google Drive directory '${googleDriveDir}' does not exist`;
                    logs.push(createLogEntry(errorMessage, LogLevel.ERROR));
                    throw Error(errorMessage);
                }

                const output = await runShellCommand(shellCommand, cliOptions, {
                    cwd: googleDriveDir,
                    dryRun: options.job.dryRun
                });
                logs.push(... output.logs);

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

export default grivePlugin;
