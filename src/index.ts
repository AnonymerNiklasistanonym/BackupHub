/* eslint-disable no-console */
/* eslint-disable no-duplicate-imports */

import abruneggOneDrive, { AbruneggOneDriveCommands } from "./plugins/abruneggOnedrive";
import grive, { GriveCommands } from "./plugins/grive";
import rsync, { RsyncCommand } from "./plugins/rsync";
import type { AbruneggOneDrive } from "./plugins/abruneggOnedrive";
import backupHub from "./api/backupHub";
import type { Grive } from "./plugins/grive";
import { logFormatter } from "./api/helper/logFormatter";
import type { Rsync } from "./plugins/rsync";

// Debug console
// import { debuglog } from "util";
// const debug = debuglog("app");

(async (): Promise<void> => {

    console.log(backupHub.version);

    console.log(logFormatter(await backupHub.addPlugin(rsync)));
    console.log(logFormatter(await backupHub.addPlugin(abruneggOneDrive)));
    console.log(logFormatter(await backupHub.addPlugin(grive)));

    backupHub.addGlobalVariable({
        description: "The external backup drives",
        name: "BACKUP_DRIVE",
        value: [ "/run/media/${USER}/Backup 4TB", "/run/media/${USER}/Backup #1" ]
    });
    backupHub.addGlobalVariable({
        name: "USER",
        value: "niklas"
    });

    const outputBackupHomeDir = await backupHub.runJob({
        data: {
            backupDirs: ["${...BACKUP_DRIVE}/BackupManjaroDesktop/home_${USER}"],
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
    console.log(logFormatter(outputBackupHomeDir.log));

    const outputBackupOneDriveDir = await backupHub.runJob({
        data: {
            backupDirs: ["${...BACKUP_DRIVE}/Cloud/OneDrive (${USER} - latest)"],
            sourceDir: "/home/${USER}/OneDrive"
        },
        instructions: [
            {
                command: AbruneggOneDriveCommands.SYNCHRONIZE,
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
    console.log(logFormatter(outputBackupOneDriveDir.log));


    const outputBackupGoogleDriveDir = await backupHub.runJob({
        data: {
            backupDirs: ["${...BACKUP_DRIVE}/Cloud/GoogleDrive (${USER} - latest)"],
            sourceDir: "/home/${USER}/GoogleDrive"
        },
        instructions: [
            {
                command: GriveCommands.SYNCHRONIZE,
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
    console.log(logFormatter(outputBackupGoogleDriveDir.log));

})().catch(err => {
    console.error(err);
    process.exit(1);
});
