import { existsSync, promises as fs } from "fs";
import type { Log, Plugin } from "../api/backupHub";
import { RsyncCommands, runRsync } from "./rsync/rsync";
import commandExists from "command-exists";
import { LogLevel } from "../api/logLevel";
import { resolveVariableString } from "../api/helper/variableResolution";
import type { Rsync } from "./rsync/types";
export type { Rsync } from "./rsync/types";
export { RsyncCommands } from "./rsync/rsync";


export const pluginName = "Rsync";
export const rsyncCommand = "rsync";

const rsyncPlugin: Plugin = {
    name: pluginName,
    routines: {
        // eslint-disable-next-line complexity
        runInstruction: async (options, instruction): Promise<Plugin.Output> => {
            const logs: Log.Entry[] = [];
            const rsyncInstruction = instruction as Rsync.Instruction;

            const cliOptions: string[] = [];
            if (rsyncInstruction.command === RsyncCommands.CUSTOM) {
                // Set nothing
                if (rsyncInstruction.options.archive === true) {
                    cliOptions.push("--archive");
                }
                if (rsyncInstruction.options.recursive === true) {
                    cliOptions.push("--recursive");
                }
                if (rsyncInstruction.options.delete === true) {
                    cliOptions.push("--delete");
                }
                if (rsyncInstruction.options.deleteExcluded === true) {
                    cliOptions.push("--delete-excluded");
                }
                if (rsyncInstruction.options.verbose === true) {
                    cliOptions.push("--verbose");
                }
            } else if (rsyncInstruction.command === RsyncCommands.SYNCHRONIZE) {
                if (rsyncInstruction.options.archive === true) {
                    cliOptions.push("--archive");
                }
                if (rsyncInstruction.options.recursive !== false) {
                    cliOptions.push("--recursive");
                }
                if (rsyncInstruction.options.delete !== false) {
                    cliOptions.push("--delete");
                }
                if (rsyncInstruction.options.deleteExcluded !== true) {
                    cliOptions.push("--delete-excluded");
                }
                if (rsyncInstruction.options.verbose !== false) {
                    cliOptions.push("--verbose");
                }
            }
            if (rsyncInstruction.options.excludeFrom) {
                for (const file of rsyncInstruction.options.excludeFrom) {
                    const files = resolveVariableString(options.globals.variables, file);
                    if (Array.isArray(files)) {
                        cliOptions.push(... files.map(a => `--exclude-from=${a}`));
                    } else {
                        cliOptions.push(`--exclude-from=${files}`);
                    }
                }
            }
            // source dir
            const sourceDir = resolveVariableString(options.globals.variables,
                rsyncInstruction.options.sourceDir);
            if (Array.isArray(sourceDir)) {
                throw Error(`Rsync Plugin: Source directory (${
                    rsyncInstruction.options.sourceDir}) resolved to more than one path:\n${
                    JSON.stringify(sourceDir)}`);
            }
            cliOptions.push(sourceDir);
            // backup dir
            let backupDirs = resolveVariableString(options.globals.variables,
                rsyncInstruction.options.backupDirs);
            if (!Array.isArray(backupDirs)) {
                backupDirs = [backupDirs];
            }
            for (const backupDir of backupDirs) {
                if (!existsSync(backupDir)) {
                    logs.push({
                        content: `Directory was not found - try to create it: "${backupDir}"`,
                        creator: pluginName,
                        level: LogLevel.INFO,
                        time: new Date()
                    });
                    try {
                        await fs.mkdir(backupDir, { recursive: true });
                        logs.push({
                            content: `Directory was created: "${backupDir}"`,
                            creator: pluginName,
                            level: LogLevel.INFO,
                            time: new Date()
                        });
                    } catch (err) {
                        logs.push({
                            content: `Stop - the directory could not be created: "${backupDir}"`,
                            creator: pluginName,
                            level: LogLevel.ERROR,
                            time: new Date()
                        });
                        continue;
                    }
                }
                const output = await runRsync(rsyncCommand, [ ... cliOptions, backupDir ].map(a => `'${a}'`));
                logs.push(... output);
            }

            return { log: logs };
        },
        setup: async (): Promise<Plugin.Output> => {
            const logs: Log.Entry[] = [];

            logs.push({
                content: `Check if the '${rsyncCommand}' command can be found`,
                creator: pluginName,
                time: new Date()
            });
            const rsyncFound = await new Promise<boolean>((resolve, reject) => {
                commandExists(rsyncCommand, (err, exists) => {
                    if (err) {
                        return reject(err);
                    }
                    logs.push({
                        content: `The '${rsyncCommand}' command was found: ${exists}`,
                        creator: pluginName,
                        time: new Date()
                    });
                    return resolve(exists);
                });
            });

            if (!rsyncFound) {
                throw Error(`${pluginName} Plugin: The command '${rsyncCommand}' was not found`);
            }

            return { log: logs };
        }
    },
    version: {
        major: 1
    }
};

export default rsyncPlugin;
