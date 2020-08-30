import {
    checkAndCreateBackupDir, commandCanBeFound, createLogEntryGenerator,
    resolveVariableString
} from "../api/helper";
import { debuglog } from "util";
import { gitBackupRepo } from "./github/githubInternal";
import type { GitHub } from "./github/types";
export type { GitHub } from "./github/types";
// eslint-disable-next-line no-duplicate-imports
import type { GitHubRepoInfo } from "./github/githubInternal";
import type { Log } from "../api/log";
import { LogLevel } from "../api/logLevel";
import { Octokit } from "@octokit/rest";
import path from "path";
import type { Plugin } from "../api/plugin";
import { PluginError } from "../api/error";



export const pluginName = "GitHub";
export enum GitHubCommand {
    BACKUP_REPOS = "BACKUP_REPOS"
}

const debug = debuglog("app-plugin-github");
const createLogEntry = createLogEntryGenerator(debug, pluginName);

const shellCommand = "git";

const gitHubPlugin: Plugin = {
    name: pluginName,
    routines: {
        // eslint-disable-next-line complexity
        runInstruction: async (options, instruction): Promise<Plugin.Output> => {
            const logs: Log.Entry[] = [];

            try {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                const gitHubInstruction = instruction as GitHub.Instruction;
                logs.push(createLogEntry(JSON.stringify(gitHubInstruction), LogLevel.DEBUG));

                if (gitHubInstruction.command === GitHubCommand.BACKUP_REPOS) {
                    // No special things
                } else {
                    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                    throw Error(`The command '${gitHubInstruction.command}' is not supported`);
                }

                // Read config data
                const token = gitHubInstruction.options.githubApiOauthToken;
                const owner = gitHubInstruction.options.githubApiAccountName;

                // Get git repositories
                const octokit = new Octokit({
                    auth: token,
                    userAgent: "BackupGitHubRepos"
                });

                // eslint-disable-next-line camelcase
                const octokitRequestInfo = { owner, page: 1, per_page: 100 };
                const repositories: GitHubRepoInfo[] = [];
                let emptyOrNotFullResults = false;
                do {
                    const request = await octokit.repos.listForAuthenticatedUser(octokitRequestInfo);
                    const repoData = request.data as unknown as GitHubRepoInfo[];
                    repositories.push(... repoData);
                    octokitRequestInfo.page++;
                    emptyOrNotFullResults = repoData.length === 0 || repoData.length < octokitRequestInfo.per_page;
                } while (!emptyOrNotFullResults);
                logs.push(createLogEntry(`${repositories.length} repositories from the account '${
                    owner}' were found`, LogLevel.DEBUG));

                // Resolve backup directories
                let backupDirs = resolveVariableString(options.globals.variables,
                    gitHubInstruction.options.backupDirs);
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
                        const repoDir = path.join(backupDir, repo.owner.login, repo.name);
                        logs.push(createLogEntry(`(${index + 1}/${repositories.length}) Backup repo '${
                            repo.full_name}'...`));
                        const codeOutput = await gitBackupRepo(repoDir, token, repo.full_name, options.job.dryRun);
                        logs.push(... codeOutput);
                        // Try to clone the wiki (when enabled)
                        if (repo.has_wiki) {
                            try {
                                logs.push(createLogEntry(`Try to backup wiki repo '${repo.full_name}.wiki'...`,
                                    LogLevel.DEBUG));
                                const repoWikiDir = path.join(backupDir, repo.owner.login, `${repo.name}_wiki`);
                                const codeOutputWiki = await gitBackupRepo(repoWikiDir, token, `${
                                    repo.full_name}.wiki`, options.job.dryRun);
                                logs.push(... codeOutputWiki);
                            } catch (error) {
                                logs.push(createLogEntry(`>> No wiki found ('${repo.full_name}.wiki')`,
                                    LogLevel.DEBUG));
                            }
                        }
                    }));

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

export default gitHubPlugin;
