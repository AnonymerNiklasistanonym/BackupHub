import {
    checkAndCreateBackupDir, commandCanBeFound, createLogEntryGenerator,
    createVersionStringPlugin, resolveVariableString
} from "../api/helper";
import { debuglog } from "util";
import { gitBackupRepo } from "./git/gitInternal";
import { Gitlab as Gitbeaker } from "@gitbeaker/node";
import type { GitLab } from "./gitlab/types";
export type { GitLab } from "./gitlab/types";
import type { Log } from "../api/log";
import { LogLevel } from "../api/logLevel";
import path from "path";
import type { Plugin } from "../api/plugin";
import { PluginError } from "../api/error";


export const pluginName = "GitLab";
export const pluginVersionNumbers: Plugin.Info.Version = {
    major: 1
};
export const pluginVersion = createVersionStringPlugin(pluginVersionNumbers);
export enum GitLabCommand {
    BACKUP_REPOS = "BACKUP_REPOS"
}

export interface GitLabRepoInfo {
    owner: { login: string }
    name: string
    // eslint-disable-next-line camelcase
    full_name: string
    // eslint-disable-next-line camelcase
    has_wiki: boolean
}

const debug = debuglog("app-plugin-gitlab");
const createLogEntry = createLogEntryGenerator(debug, pluginName);

const shellCommand = "git";

const gitlabPlugin: Plugin = {
    name: pluginName,
    routines: {
        // eslint-disable-next-line complexity
        runInstruction: async (options, instruction): Promise<Plugin.Output> => {
            const logs: Log.Entry[] = [];

            try {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                const gitlabInstruction = instruction as GitLab.Instruction;
                logs.push(createLogEntry(JSON.stringify(gitlabInstruction), LogLevel.DEBUG));

                if (gitlabInstruction.command === GitLabCommand.BACKUP_REPOS) {
                    // No special things
                } else {
                    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                    throw Error(`The command '${gitlabInstruction.command}' is not supported`);
                }

                // Read config data
                const token = gitlabInstruction.options.gitlabApiOauthToken;
                const url = gitlabInstruction.options.gitlabApiHostUrl;
                const owner = gitlabInstruction.options.gitlabApiAccountName;

                // Get git repositories
                const gitbeaker = new Gitbeaker({
                    host: `https://${url}`,
                    oauthToken: token
                });

                // const currentUser = await gitbeaker.Users.current();
                const repositories = await gitbeaker.Projects.all({ membership: true, owned: true });
                logs.push(createLogEntry(`${repositories.length} repositories from the account '${
                    owner}' were found`, LogLevel.DEBUG));

                // Resolve backup directories
                let backupDirs = resolveVariableString(options.globals.variables,
                    gitlabInstruction.options.backupDirs);
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
                    await Promise.all(repositories.map(async (repo, index) => {
                        const repoDir = path.join(backupDir, repo.namespace.path, repo.name);
                        logs.push(createLogEntry(`(${index + 1}/${repositories.length}) Backup repo '${
                            repo.namespace.path}/${repo.path}'...`));
                        try {
                            const codeOutput = await gitBackupRepo(repoDir, url, `oauth:${token}`,
                                repo.namespace.path + "/" + repo.path, options.job.dryRun);
                            logs.push(... codeOutput);
                        } catch (err) {
                            throw err;
                        }
                    }));

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

export default gitlabPlugin;
