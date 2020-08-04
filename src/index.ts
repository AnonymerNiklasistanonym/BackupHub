/* eslint-disable no-console */
/* eslint-disable no-duplicate-imports */

import backupHub from "./api/backupHub";
import { logFormatter } from "./api/helper/logPrinter";
import type { Rsync } from "./plugins/rsync";
import rsync from "./plugins/rsync";

// Debug console
// import { debuglog } from "util";
// const debug = debuglog("app");

(async (): Promise<void> => {

    console.log(backupHub.version);

    console.log(logFormatter(await backupHub.addPlugin(rsync)));

    backupHub.addGlobalVariable({
        description: "The external backup drives",
        name: "BACKUP_DRIVE",
        value: [ "/run/media/${USER}/Backup 4TB", "/run/media/${USER}/Backup #1" ]
    });
    backupHub.addGlobalVariable({
        name: "USER",
        value: "niklas"
    });

    const output = await backupHub.runJob({
        data: {
            backupDirs: [
                "${...BACKUP_DRIVE}/BackupManjaroDesktop/"
            ],
            sourceDir: "/home/${USER}/"
        },
        instructions: [
            {
                command: "Sync",
                options: {
                    backupDirs: ["${...BACKUP_DIR}"],
                    sourceDir: "${SOURCE_DIR}"
                },
                plugin: "Rsync"
            } as Rsync.Instruction
        ],
        name: "Backup home directory"
    });

    console.log(logFormatter(output.log));

})().catch(err => {
    console.error(err);
    process.exit(1);
});
