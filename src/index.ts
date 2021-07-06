/* eslint-disable no-console */
/* eslint-disable no-duplicate-imports */

import * as fsOld from "fs";
import * as path from "path";
import abruneggOneDrive, { AbruneggOneDriveCommand } from "./plugins/abruneggOnedrive";
import copyFiles, { CopyFilesCommand } from "./plugins/copyFiles";
import git, { GitCommand } from "./plugins/git";
import github, { GitHubCommand } from "./plugins/github";
import gitlab, { GitLabCommand } from "./plugins/gitlab";
import grive, { GriveCommand } from "./plugins/grive";
import pacman, { PacmanCommand } from "./plugins/pacman";
import rsync, { RsyncCommand } from "./plugins/rsync";
import type { AbruneggOneDrive } from "./plugins/abruneggOnedrive";
import backupHub from "./api/backupHub";
import type { CopyFiles } from "./plugins/copyFiles";
import { promises as fs } from "fs";
import type { Git } from "./plugins/git";
import type { GitHub } from "./plugins/github";
import type { GitLab } from "./plugins/gitlab";
import type { Grive } from "./plugins/grive";
import { logFormatter } from "./api/helper/logFormatter";
import { LogLevel } from "./api/logLevel";
import type { Pacman } from "./plugins/pacman";
import type { PluginError } from "./api/error";
import type { Rsync } from "./plugins/rsync";


// Global run properties:
const dryRun = true;
const logLevel = LogLevel.INFO;


(async (): Promise<void> => {

    // Print program version
    console.log(backupHub.version);

    // Add plugin: (if provided it runs checks to verify integrity)
    console.log(logFormatter(await backupHub.addPlugin(abruneggOneDrive), logLevel));
    console.log(logFormatter(await backupHub.addPlugin(copyFiles), logLevel));
    console.log(logFormatter(await backupHub.addPlugin(git), logLevel));
    console.log(logFormatter(await backupHub.addPlugin(github), logLevel));
    console.log(logFormatter(await backupHub.addPlugin(gitlab), logLevel));
    console.log(logFormatter(await backupHub.addPlugin(grive), logLevel));
    console.log(logFormatter(await backupHub.addPlugin(pacman), logLevel));
    console.log(logFormatter(await backupHub.addPlugin(rsync), logLevel));

    // Add global (available in every job) variables:
    backupHub.addGlobalVariable({
        description: "The external backup drives",
        name: "BACKUP_DRIVE",
        value: [
            "/run/media/${CURRENT_USER}/Backup 4TB",
            "/run/media/${CURRENT_USER}/Backup #1"
        ]
    });
    backupHub.addGlobalVariable({
        name: "BACKUP_USER",
        value: "niklas"
    });
    // Use this variable in case this program is run via a live disc and the
    backupHub.addGlobalVariable({
        name: "CURRENT_USER",
        value: "niklas" // for example "manjaro" when using the manjaro live iso
    });
    // Use this variable in case this program is run via a live disc and the
    // directory to backup is actually mounted to a "/run/media/xyz" drive
    backupHub.addGlobalVariable({
        name: "MOUNTED_DISC_HOME_DIR",
        value: "/home"
    });


    // Jobs to execute:
    const outputBackupHomeDir = await backupHub.runJob({
        data: {
            backupDirs: ["${...BACKUP_DRIVE}/BackupManjaroDesktop/home_${BACKUP_USER}"],
            dryRun,
            sourceDir: "${MOUNTED_DISC_HOME_DIR}/${BACKUP_USER}"
        },
        instructions: [
            {
                command: RsyncCommand.SYNCHRONIZE,
                options: {
                    backupDirs: ["${...BACKUP_DIR}/"],
                    excludeFrom: [path.join(__dirname, "..", "example_rsync_exclude_list.txt")],
                    sourceDir: "${SOURCE_DIR}/"
                },
                plugin: "Rsync"
            } as Rsync.Instruction
        ],
        name: "Backup home directory"
    });
    console.log(logFormatter(outputBackupHomeDir.log, logLevel));

    const outputBackupOneDriveDir = await backupHub.runJob({
        data: {
            backupDirs: ["${...BACKUP_DRIVE}/Cloud/OneDrive (${BACKUP_USER} - latest)"],
            dryRun,
            sourceDir: "${MOUNTED_DISC_HOME_DIR}/${BACKUP_USER}/OneDrive"
        },
        instructions: [
            {
                command: AbruneggOneDriveCommand.SYNCHRONIZE,
                options: {},
                plugin: "AbruneggOneDrive"
            } as AbruneggOneDrive.Instruction,
            {
                command: RsyncCommand.SYNCHRONIZE,
                options: {
                    backupDirs: ["${...BACKUP_DIR}/"],
                    sourceDir: "${SOURCE_DIR}/"
                },
                plugin: "Rsync"
            } as Rsync.Instruction
        ],
        name: "Backup OneDrive directory"
    });
    console.log(logFormatter(outputBackupOneDriveDir.log, logLevel));

    const outputBackupGoogleDriveDir = await backupHub.runJob({
        data: {
            backupDirs: ["${...BACKUP_DRIVE}/Cloud/GoogleDrive (${BACKUP_USER} - latest)"],
            dryRun,
            sourceDir: "${MOUNTED_DISC_HOME_DIR}/${BACKUP_USER}/Documents/GoogleDrive"
        },
        instructions: [
            {
                command: GriveCommand.SYNCHRONIZE,
                options: {
                    googleDriveDir: "${SOURCE_DIR}"
                },
                plugin: "Grive"
            } as Grive.Instruction,
            {
                command: RsyncCommand.SYNCHRONIZE,
                options: {
                    backupDirs: ["${...BACKUP_DIR}/"],
                    sourceDir: "${SOURCE_DIR}/"
                },
                plugin: "Rsync"
            } as Rsync.Instruction
        ],
        name: "Backup GoogleDrive directory"
    });
    console.log(logFormatter(outputBackupGoogleDriveDir.log, logLevel));

    const outputCopyFiles = await backupHub.runJob({
        data: {
            backupDirs: ["${...BACKUP_DRIVE}/BackupManjaroDesktop"],
            dryRun,
            sourceDir: "/etc"
        },
        instructions: [
            {
                command: CopyFilesCommand.COPY,
                options: {
                    backupDirs: ["${...BACKUP_DIR}/host_files"],
                    deleteBackupDir: true,
                    glob: true,
                    sourceFiles: ["${SOURCE_DIR}/hosts*"]
                },
                plugin: "CopyFiles"
            } as CopyFiles.Instruction
        ],
        name: "Backup hosts files"
    });
    console.log(logFormatter(outputCopyFiles.log, logLevel));

    const outputCopyFilesVscodeSettings = await backupHub.runJob({
        data: {
            backupDirs: ["${...BACKUP_DRIVE}/BackupManjaroDesktop"],
            dryRun,
            sourceDir: "${MOUNTED_DISC_HOME_DIR}/${BACKUP_USER}/.config/Code - Insiders/User"
        },
        instructions: [
            {
                command: CopyFilesCommand.COPY,
                options: {
                    backupDirs: ["${...BACKUP_DIR}/vscode_settings_${BACKUP_USER}"],
                    deleteBackupDir: true,
                    glob: true,
                    sourceFiles: [
                        "${SOURCE_DIR}/keybindings.json",
                        "${SOURCE_DIR}/settings.json",
                        "${SOURCE_DIR}/syncLocalSettings.json",
                        "${SOURCE_DIR}/snippets"
                    ]
                },
                plugin: "CopyFiles"
            } as CopyFiles.Instruction
        ],
        name: "Backup VSCode setting files"
    });
    console.log(logFormatter(outputCopyFilesVscodeSettings.log, logLevel));

    const outputPacmanBackup = await backupHub.runJob({
        data: {
            backupDirs: ["${...BACKUP_DRIVE}/BackupManjaroDesktop"],
            dryRun,
            sourceDir: "${MOUNTED_DISC_HOME_DIR}/${BACKUP_USER}"
        },
        instructions: [
            {
                command: PacmanCommand.GET_PACKAGE_LIST_JSON,
                options: {
                    jsonOutputFilePaths: ["${...BACKUP_DIR}/installed_programs_pacman_${BACKUP_USER}.json"]
                },
                plugin: "Pacman"
            } as Pacman.Instruction
        ],
        name: "Backup installed programs from Pacman"
    });
    console.log(logFormatter(outputPacmanBackup.log, logLevel));

    // This job will only run if you provide a github_credentials.json file with
    // your account name and an OAuth token
    const githubCredentialsListFilePath = path.join(__dirname, "..", "github_credentials.json");
    if (fsOld.existsSync(githubCredentialsListFilePath)) {
        interface GitHubApiCredentials {
            accountName: string
            oauthToken: string
        }
        const githubApiCredentials = await JSON.parse((
            await fs.readFile(githubCredentialsListFilePath)).toString()) as GitHubApiCredentials;

        const outputGitHubBackup = await backupHub.runJob({
            data: {
                backupDirs: ["${...BACKUP_DRIVE}"],
                dryRun,
                sourceDir: "${MOUNTED_DISC_HOME_DIR}/${BACKUP_USER}"
            },
            description: `based on the information of ${githubCredentialsListFilePath}`,
            instructions: [
                {
                    command: GitHubCommand.BACKUP_REPOS,
                    options: {
                        backupDirs: ["${...BACKUP_DIR}/BackupGitHubRepos_${BACKUP_USER}"],
                        githubApiAccountName: githubApiCredentials.accountName,
                        githubApiOauthToken: githubApiCredentials.oauthToken
                    },
                    plugin: "GitHub"
                } as GitHub.Instruction
            ],
            name: "Backup GitHub account connected repositories"
        });
        console.log(logFormatter(outputGitHubBackup.log, logLevel));
    }

    // This job will only run if you provide a gitlab_credentials.json file with
    // your account name and an OAuth token (and host URL to support self hosted
    // instances)
    const gitlabCredentialsFilePath = path.join(__dirname, "..", "gitlab_credentials.json");
    if (fsOld.existsSync(gitlabCredentialsFilePath)) {
        interface GitLabApiCredentials {
            accountName: string
            hostUrl: string
            oauthToken: string
        }
        const gitlabApiCredentials = await JSON.parse((
            await fs.readFile(gitlabCredentialsFilePath)).toString()) as GitLabApiCredentials;

        const outputGitLabBackup = await backupHub.runJob({
            data: {
                backupDirs: ["${...BACKUP_DRIVE}"],
                dryRun,
                sourceDir: "${MOUNTED_DISC_HOME_DIR}/${BACKUP_USER}"
            },
            description: `based on the information of ${gitlabCredentialsFilePath}`,
            instructions: [
                {
                    command: GitLabCommand.BACKUP_REPOS,
                    options: {
                        backupDirs: ["${...BACKUP_DIR}/BackupGitLabRepos_${BACKUP_USER}"],
                        gitlabApiAccountName: gitlabApiCredentials.accountName,
                        gitlabApiHostUrl: gitlabApiCredentials.hostUrl,
                        gitlabApiOauthToken: gitlabApiCredentials.oauthToken
                    },
                    plugin: "GitLab"
                } as GitLab.Instruction
            ],
            name: "Backup GitLab account connected repositories"
        });
        console.log(logFormatter(outputGitLabBackup.log, logLevel));
    }

    // This job will only run if you provide a other_git_repo_list.json file
    // with paths to otherwise hosted git repositories
    const otherGitRepoListFilePath = path.join(__dirname, "..", "other_git_repo_list.json");
    if (fsOld.existsSync(otherGitRepoListFilePath)) {
        const otherGitRepoList = await JSON.parse((
            await fs.readFile(otherGitRepoListFilePath)).toString()) as Git.Repo[];

        const outputOtherGitReposBackup = await backupHub.runJob({
            data: {
                backupDirs: ["${...BACKUP_DRIVE}"],
                dryRun,
                sourceDir: "/home/${BACKUP_USER}"
            },
            description: `based on the information of ${otherGitRepoListFilePath}`,
            instructions: [
                {
                    command: GitCommand.BACKUP_REPOS,
                    options: {
                        backupDirs: ["${...BACKUP_DIR}/BackupOtherGitRepos_${BACKUP_USER}"],
                        gitRepoList: otherGitRepoList
                    },
                    plugin: "Git"
                } as Git.Instruction
            ],
            name: "Backup other Git repositories"
        });
        console.log(logFormatter(outputOtherGitReposBackup.log, logLevel));
    }

})().catch(err => {
    console.error(err);
    const errorLogs = (err as PluginError).logs;
    if (errorLogs) {
        console.log(logFormatter(errorLogs, logLevel));
    }
    process.exit(1);
});
