# BackupHub

Cross platform program for easy backups and good plugin support.

## Warning

**This code is not thoroughly tested which means it could somehow delete you drive/backup/etc!!!**

This is only a personal solution for myself to not use a bash backup script which was too limited and *complicated* for me as soon as I wanted to do more advanced things.

## Quickstart

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

## Future Plans

- Add plugins:
  - gitlab (account)
  - github (account - port [BackupGitHubRepos](https://github.com/AnonymerNiklasistanonym/BackupGitHubRepos))
  - private git repos (pacman AUR repos with private key and password)
- Create a JSON file parser to only pass a JSON configuration file to this program.
- Make log levels important (currently they do not matter)
- More tests
