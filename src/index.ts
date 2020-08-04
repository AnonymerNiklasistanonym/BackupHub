/* eslint-disable no-console */
/* eslint-disable no-duplicate-imports */

import abruneggOneDrive, { AbruneggOneDriveCommands } from "./plugins/abruneggOnedrive";
import rsync, { RsyncCommands } from "./plugins/rsync";
import type { AbruneggOneDrive } from "./plugins/abruneggOnedrive";
import backupHub from "./api/backupHub";
import { logFormatter } from "./api/helper/logPrinter";
import type { Rsync } from "./plugins/rsync";

// Debug console
// import { debuglog } from "util";
// const debug = debuglog("app");

(async (): Promise<void> => {

    console.log(backupHub.version);

    console.log(logFormatter(await backupHub.addPlugin(rsync)));
    console.log(logFormatter(await backupHub.addPlugin(abruneggOneDrive)));

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
            backupDirs: ["${...BACKUP_DRIVE}/BackupManjaroDesktop"],
            sourceDir: "/home/${USER}"
        },
        instructions: [
            {
                command: RsyncCommands.SYNCHRONIZE,
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
                command: RsyncCommands.SYNCHRONIZE,
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

})().catch(err => {
    console.error(err);
    process.exit(1);
});
