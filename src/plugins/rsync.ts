import { existsSync, promises as fs } from "fs";
import type { Log, Plugin } from "../api/backupHub";
import { Rsync, runRsync } from "./rsync/rsync";
import commandExists from "command-exists";
import { LogLevel } from "../api/logLevel";
import { resolveVariableString } from "../api/helper/variableResolution";
export type { Rsync } from "./rsync/rsync";


export const pluginName = "Rsync";
export const rsyncCommand = "rsync";

const rsyncPlugin: Plugin = {
    name: pluginName,
    routines: {
        runInstruction: async (options, instruction) => {
            const logs: Log.Entry[] = [];
            const rsyncInstruction = instruction as Rsync.Instruction;
            console.info(options.job);

            const cliOptions: string[] = [];
            if (rsyncInstruction.command === "Sync") {
                cliOptions.push("--recursive", "--archive", "--verbose", "--delete",
                    "--exclude-from=/home/niklas/Documents/github/BackupScriptsLinux/rsync_exclude_list.txt",
                    "--delete-excluded");
            }
            // source dir
            console.info(options.globals.variables, rsyncInstruction.options.sourceDir);
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
        setup: async (options) => {
            const logs: Log.Entry[] = [];

            logs.push({
                content: "Check if the rsync command can be found",
                creator: pluginName,
                time: new Date()
            });
            const rsyncFound = await new Promise<boolean>((resolve, reject) => {
                commandExists(rsyncCommand, (err, exists) => {
                    if (err) {
                        return reject(err);
                    }
                    logs.push({
                        content: `The rsync command was found: ${exists}`,
                        creator: pluginName,
                        time: new Date()
                    });
                    return resolve(exists);
                });
            });

            if (!rsyncFound) {
                throw Error(`Rsync Plugin: The command '${rsyncCommand}' was not found`);
            }

            return { log: logs };
        }
    },
    version: {
        major: 1
    }
};

export default rsyncPlugin;
