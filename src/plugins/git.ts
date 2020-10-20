import {
    checkAndCreateBackupDir, commandCanBeFound, createLogEntryGenerator,
    resolveVariableString
} from "../api/helper";
import { debuglog } from "util";
import type { Git } from "./git/types";
export type { Git } from "./git/types";
import { gitBackupRepo } from "./git/gitInternal";
import type { Log } from "../api/log";
import { LogLevel } from "../api/logLevel";
import path from "path";
import type { Plugin } from "../api/plugin";
import { PluginError } from "../api/error";



export const pluginName = "Git";
export enum GitCommand {
    BACKUP_REPOS = "BACKUP_REPOS"
}

const debug = debuglog("app-plugin-git");
const createLogEntry = createLogEntryGenerator(debug, pluginName);

const shellCommand = "git";

const gitPlugin: Plugin = {
    name: pluginName,
    routines: {
        // eslint-disable-next-line complexity
        runInstruction: async (options, instruction): Promise<Plugin.Output> => {
            const logs: Log.Entry[] = [];

            try {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                const gitInstruction = instruction as Git.Instruction;
                logs.push(createLogEntry(JSON.stringify(gitInstruction), LogLevel.DEBUG));

                if (gitInstruction.command === GitCommand.BACKUP_REPOS) {
                    // No special things
                } else {
                    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                    throw Error(`The command '${gitInstruction.command}' is not supported`);
                }

                // Read config data
                const gitRepoList = gitInstruction.options.gitRepoList;

                // Resolve backup directories
                let backupDirs = resolveVariableString(options.globals.variables,
                    gitInstruction.options.backupDirs);
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
                    // Clone git repositories or update already cloned ones
                    await Promise.all(gitRepoList.map(async (repo, index) => {
                        const repoDir = path.join(backupDir, repo.name);
                        logs.push(createLogEntry(`(${index + 1}/${gitRepoList.length}) Backup repo '${repo.name}'...`));
                        try {
                            const codeOutput = await gitBackupRepo(repoDir, repo.baseUrl, undefined,
                                repo.name, options.job.dryRun);
                            logs.push(... codeOutput);
                        } catch (err) {
                            throw err;
                        }
                    }));

                }
            } catch (err) {
                const pluginErrorLogs = (err as PluginError).logs;
                if (pluginErrorLogs) {
                    logs.push(... pluginErrorLogs);
                }
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
                const pluginErrorLogs = (err as PluginError).logs;
                if (pluginErrorLogs) {
                    logs.push(... pluginErrorLogs);
                }
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

export default gitPlugin;
