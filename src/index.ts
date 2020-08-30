/* eslint-disable no-console */
/* eslint-disable no-duplicate-imports */

import abruneggOneDrive, { AbruneggOneDriveCommand } from "./plugins/abruneggOnedrive";
import copyFiles, { CopyFilesCommand } from "./plugins/copyFiles";
import github, { GitHubCommand } from "./plugins/github";
import grive, { GriveCommand } from "./plugins/grive";
import pacman, { PacmanCommand } from "./plugins/pacman";
import rsync, { RsyncCommand } from "./plugins/rsync";
import type { AbruneggOneDrive } from "./plugins/abruneggOnedrive";
import backupHub from "./api/backupHub";
import type { CopyFiles } from "./plugins/copyFiles";
import type { GitHub } from "./plugins/github";
import type { Grive } from "./plugins/grive";
import { logFormatter } from "./api/helper/logFormatter";
import { LogLevel } from "./api/logLevel";
import type { Pacman } from "./plugins/pacman";
import type { Rsync } from "./plugins/rsync";


(async (): Promise<void> => {

    // Print program version
    console.log(backupHub.version);

    // Global run properties:
    const dryRun = true;
    const logLevel = LogLevel.INFO;

    // Add plugin: (if provided it runs checks to verify integrity)
    console.log(logFormatter(await backupHub.addPlugin(abruneggOneDrive), logLevel));
    console.log(logFormatter(await backupHub.addPlugin(copyFiles), logLevel));
    console.log(logFormatter(await backupHub.addPlugin(github), logLevel));
    console.log(logFormatter(await backupHub.addPlugin(grive), logLevel));
    console.log(logFormatter(await backupHub.addPlugin(pacman), logLevel));
    console.log(logFormatter(await backupHub.addPlugin(rsync), logLevel));

    // Add global (available in every job) variables:
    backupHub.addGlobalVariable({
        description: "The external backup drives",
        name: "BACKUP_DRIVE",
        value: [ "/run/media/${USER}/Backup 4TB", "/run/media/${USER}/Backup #1" ]
    });
    backupHub.addGlobalVariable({
        name: "USER",
        value: "niklas"
    });

    // Jobs to execute:
    const outputBackupHomeDir = await backupHub.runJob({
        data: {
            backupDirs: ["${...BACKUP_DRIVE}/BackupManjaroDesktop/home_${USER}"],
            dryRun,
            sourceDir: "/home/${USER}"
        },
        instructions: [
            {
                command: RsyncCommand.SYNCHRONIZE,
                options: {
                    backupDirs: ["${...BACKUP_DIR}/"],
                    excludeFrom: ["/home/${USER}/Documents/github/BackupScriptsLinux/rsync_exclude_list.txt"],
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
            backupDirs: ["${...BACKUP_DRIVE}/Cloud/OneDrive (${USER} - latest)"],
            dryRun,
            sourceDir: "/home/${USER}/OneDrive"
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
            backupDirs: ["${...BACKUP_DRIVE}/Cloud/GoogleDrive (${USER} - latest)"],
            dryRun,
            sourceDir: "/home/${USER}/GoogleDrive"
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
        name: "Backup OneDrive directory"
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
            sourceDir: "/home/${USER}/.config/Code - Insiders/User"
        },
        instructions: [
            {
                command: CopyFilesCommand.COPY,
                options: {
                    backupDirs: ["${...BACKUP_DIR}/vscode_settings_${USER}"],
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
            sourceDir: "/home/${USER}"
        },
        instructions: [
            {
                command: PacmanCommand.GET_PACKAGE_LIST_JSON,
                options: {
                    jsonOutputFilePaths: ["${...BACKUP_DIR}/installed_programs_pacman_${USER}.json"]
                },
                plugin: "Pacman"
            } as Pacman.Instruction
        ],
        name: "Backup installed programs from Pacman"
    });
    console.log(logFormatter(outputPacmanBackup.log, logLevel));

    // const yourSecretGitHubApiAccountName = "INSERT_HERE";
    // const yourSecretGitHubApiOauthToke = "INSERT_HERE";

    // const outputGitHubBackup = await backupHub.runJob({
    //     data: {
    //         backupDirs: ["${...BACKUP_DRIVE}"],
    //         dryRun,
    //         sourceDir: "/home/${USER}"
    //     },
    //     instructions: [
    //         {
    //             command: GitHubCommand.BACKUP_REPOS,
    //             options: {
    //                 backupDirs: ["${...BACKUP_DIR}/BackupGitHubRepos_${USER}"],
    //                 githubApiAccountName: yourSecretGitHubApiAccountName,
    //                 githubApiOauthToken: yourSecretGitHubApiOauthToke
    //             },
    //             plugin: "GitHub"
    //         } as GitHub.Instruction
    //     ],
    //     name: "Backup GitHub account connected repositories"
    // });
    // console.log(logFormatter(outputGitHubBackup.log, logLevel));

})().catch(err => {
    console.error(err);
    process.exit(1);
});
