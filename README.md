# BackupHub

Cross platform program for easy backups and good plugin support.

## Warning

**This code is not thoroughly tested which means it could somehow delete you drive/backup/etc!!!**

This is only a personal solution for myself to not use a bash backup script which was too limited and *complicated* for me as soon as I wanted to do more advanced things.

## Quickstart

### Write Backup Script

- In the file [`src/index.ts`](src/index.ts) a description of a backup can be specified
  - Variables can be set that can resolve to multiple values (circular dependencies throw errors!):

    ```ts
    backupHub.addGlobalVariable({
        description: "The external backup drives",
        name: "BACKUP_DRIVE",
        value: [ "/run/media/${USER}/Backup 4TB", "/run/media/${USER}/Backup #1" ]
    });
    backupHub.addGlobalVariable({
        description: "The user name",
        name: "USER",
        value: "niklas"
    });

    const originalValue = "${...BACKUP_DRIVE}/backupDir";
    const internalResolvedValue = [
        "/run/media/niklas/Backup 4TB/backupDir",
        "/run/media/niklas/Backup #1/backupDir"
    ];
    ```

  - Jobs consist of a description and instructions:

    ```ts
    // Set dryRun to false to actually execute the job and not just print what it will do
    const outputBackupHomeDir = await backupHub.runJob({
        data: {
            backupDirs: ["${...BACKUP_DRIVE}/BackupManjaroDesktop/home_${USER}"],
            dryRun: true,
            sourceDir: "/home/${USER}"
        },
        instructions: [
            {
                command: RsyncCommand.SYNCHRONIZE,
                options: {
                    backupDirs: ["${...BACKUP_DIR}/"],
                    excludeFrom: ["/home/${USER}/rsync_exclude_list.txt"],
                    sourceDir: "${SOURCE_DIR}/"
                },
                plugin: "Rsync"
            } as Rsync.Instruction
        ],
        name: "Backup home directory"
    });
    console.log(logFormatter(outputBackupHomeDir.log));
    ```

    ```ts
    // Set dryRun to false to actually execute the job and not just print what it will do
    const outputCopyFilesVscodeSettings = await backupHub.runJob({
        data: {
            backupDirs: ["${...BACKUP_DRIVE}/BackupManjaroDesktop"],
            dryRun: true,
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
    console.log(logFormatter(outputCopyFilesVscodeSettings.log));
    ```

- New instructions can easily be added and then combined as can be seen in the directory [`src/plugins`](src/plugins)

### Run Backup Script

```sh
# This is only necessary once to be able to build the backup script
npm install
# This is necessary for every time you rewrite the backup script
npm run build
# Run this to execute the built backup script
npm run start 2>&1 | tee -a backup.log
```

If you want to debug where something goes wrong you can try the `dev` command which prints even more log messages:


```sh
# This is only necessary once to be able to build the backup script
npm install
# Run this to execute and build the backup script with debug console logging
# It is recommended to turn console logging off since otherwise the logs
# could collide and merge their output at times.
npm run dev 2>&1 | tee -a backup.log
```

## Plugin Instructions

### GitHub

To use this plugin to update your connected repositories create a GitHub access token with full `repo` level to access (to only clone and update) public/private repositories.
This information needs to be added to the command instructions, but be sure to keep this information private by loading it from an external JSON file:

```json
{
    "accountName": "Accountname",
    "oauthToken": "thegeneratedaccesstoken"
}
```

### GitLab

To use this plugin to update your connected repositories create a GitLab access token with full `api` level to access (to only clone and update) public/private repositories.
This information needs to be added to the command instructions, but be sure to keep this information private by loading it from an external JSON file:

```json
{
    "accountName": "Accountname",
    "hostUrl": "gitlab.com",
    "oauthToken": "thegeneratedaccesstoken"
}
```

### Git

To use this plugin it is advised to just load the repo list from an external JSON file:

```json
[
    {
        "name": "marktex",
        "baseUrl": "aur.archlinux.org"
    }
]
```

## Future Plans

- [ ] Create a JSON file parser to only pass a JSON configuration file to this program.
- [ ] More tests
