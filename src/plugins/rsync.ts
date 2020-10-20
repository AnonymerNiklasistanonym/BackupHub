import {
    checkAndCreateBackupDir, commandCanBeFound, createLogEntryGenerator, fileExists,
    resolveVariableString, runShellCommand
} from "../api/helper";
import { debuglog } from "util";
import type { Log } from "../api/log";
import { LogLevel } from "../api/logLevel";
import type { Plugin } from "../api/plugin";
import { PluginError } from "../api/error";
import type { Rsync } from "./rsync/types";
export type { Rsync } from "./rsync/types";


export const pluginName = "Rsync";
export enum RsyncCommand {
    SYNCHRONIZE = "SYNCHRONIZE",
    CUSTOM = "CUSTOM"
}
export const shellCommand = "rsync";


const debug = debuglog("app-plugin-rsync");
const createLogEntry = createLogEntryGenerator(debug, pluginName);


const rsyncPlugin: Plugin = {
    name: pluginName,
    routines: {
        // eslint-disable-next-line complexity
        runInstruction: async (options, instruction): Promise<Plugin.Output> => {
            const logs: Log.Entry[] = [];

            try {

                const rsyncInstruction = instruction as Rsync.Instruction;
                logs.push(createLogEntry(JSON.stringify(rsyncInstruction), LogLevel.DEBUG));

                const cliArgs: string[] = [];
                if (rsyncInstruction.command === RsyncCommand.CUSTOM) {
                    // Allow the following options to be enabled manually:
                    if (rsyncInstruction.options.recursive === true) {
                        cliArgs.push("--recursive");
                    }
                    if (rsyncInstruction.options.delete === true) {
                        cliArgs.push("--delete");
                    }
                    if (rsyncInstruction.options.deleteExcluded === true) {
                        cliArgs.push("--delete-excluded");
                    }
                    if (rsyncInstruction.options.verbose === true) {
                        cliArgs.push("--verbose");
                    }
                } else if (rsyncInstruction.command === RsyncCommand.SYNCHRONIZE) {
                    // Set the following options per default:
                    if (rsyncInstruction.options.recursive !== false) {
                        cliArgs.push("--recursive");
                    }
                    if (rsyncInstruction.options.delete !== false) {
                        cliArgs.push("--delete");
                    }
                    if (rsyncInstruction.options.deleteExcluded !== true) {
                        cliArgs.push("--delete-excluded");
                    }
                    if (rsyncInstruction.options.verbose !== false) {
                        cliArgs.push("--verbose");
                    }
                } else {
                    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                    throw Error(`The command '${rsyncInstruction.command}' is not supported`);
                }

                // Allow the following options to be enabled manually independent of all commands:
                if (rsyncInstruction.options.archive === true) {
                    cliArgs.push("--archive");
                }
                if (rsyncInstruction.options.excludeFrom) {
                    for (const file of rsyncInstruction.options.excludeFrom) {
                        const files = ([] as string[]).concat(resolveVariableString(options.globals.variables, file));
                        try {
                            for (const singleFile of files) {
                                if (!await fileExists(singleFile)) {
                                    logs.push(createLogEntry(`The exclude file '${singleFile}' was not found`,
                                        LogLevel.ERROR));
                                    throw Error(`The exclude file '${singleFile}' was not found`);
                                }
                            }
                        } catch (err) {
                            throw err;
                        }
                        cliArgs.push(... files.map(singleFile => `--exclude-from=${singleFile}`));
                    }
                }

                // Resolve source directory
                const sourceDir = resolveVariableString(options.globals.variables,
                    rsyncInstruction.options.sourceDir);
                if (Array.isArray(sourceDir)) {
                    throw Error(`Source directory '${
                        rsyncInstruction.options.sourceDir}' resolved to more than one path:\n${
                        JSON.stringify(sourceDir)}`);
                }
                cliArgs.push(sourceDir);

                // Resolve backup directories
                let backupDirs = resolveVariableString(options.globals.variables,
                    rsyncInstruction.options.backupDirs);
                if (!Array.isArray(backupDirs)) {
                    backupDirs = [backupDirs];
                }
                for (const backupDir of backupDirs) {
                    // Check if each backup directory exists or can be created
                    const backupDirStatus = await checkAndCreateBackupDir(backupDir, {
                        dryRun: options.job.dryRun
                    });
                    logs.push(... backupDirStatus.logs);
                    if (!backupDirStatus.exists) {
                        continue;
                    }
                    const output = await runShellCommand(shellCommand,
                        [ ... cliArgs, backupDir ], {
                            dryRun: options.job.dryRun
                        });
                    logs.push(... output.logs);
                }
            } catch (err) {
                const pluginError: PluginError = err as Error;
                pluginError.message = `Plugin ${pluginName}: ${pluginError.message}`;
                pluginError.logs = logs;
                throw pluginError;
            }

            return { log: logs };
        },
        setup: async (): Promise<Plugin.Output> => {
            const logs: Log.Entry[] = [];

            try {
                if (await commandCanBeFound(shellCommand)) {
                    logs.push(createLogEntry(`The '${shellCommand}' command was found`));
                } else {
                    logs.push(createLogEntry(`The '${shellCommand}' command was not found`,
                        LogLevel.ERROR));
                    throw Error(`The '${shellCommand}' command was not found`);
                }
            } catch (err) {
                const pluginError: PluginError = err as Error;
                pluginError.message = `Plugin ${pluginName}: ${pluginError.message}`;
                pluginError.logs = logs;
                throw pluginError;
            }

            return { log: logs };
        }
    },
    version: {
        major: 1
    }
};

export default rsyncPlugin;
