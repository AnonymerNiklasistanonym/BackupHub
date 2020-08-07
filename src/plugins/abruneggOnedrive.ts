import type { Log, Plugin } from "../api/backupHub";
import type { AbruneggOneDrive } from "./abruneggOneDrive/types";
export type { AbruneggOneDrive } from "./abruneggOneDrive/types";
import commandExists from "command-exists";
import { runShellCommand } from "../api/helper";


export const pluginName = "AbruneggOneDrive";
export enum AbruneggOneDriveCommand {
    SYNCHRONIZE = "SYNCHRONIZE",
    CUSTOM = "CUSTOM"
}
export const abruneggOneDriveCommand = "onedrive";

const abruneggOneDrivePlugin: Plugin = {
    name: pluginName,
    routines: {
        // eslint-disable-next-line complexity
        runInstruction: async (options, instruction): Promise<Plugin.Output> => {
            const logs: Log.Entry[] = [];
            const abruneggOneDriveInstruction = instruction as AbruneggOneDrive.Instruction;

            const cliOptions: string[] = [];
            if (abruneggOneDriveInstruction.command === AbruneggOneDriveCommand.CUSTOM) {
                // Set nothing
                if (abruneggOneDriveInstruction.options.verbose === true) {
                    cliOptions.push("--verbose");
                }
                if (abruneggOneDriveInstruction.options.verbose === true) {
                    cliOptions.push("--download");
                }
            } else if (abruneggOneDriveInstruction.command === AbruneggOneDriveCommand.SYNCHRONIZE) {
                if (abruneggOneDriveInstruction.options.verbose !== false) {
                    cliOptions.push("--verbose");
                }
                if (abruneggOneDriveInstruction.options.download === true) {
                    cliOptions.push("--download");
                }
            }

            const output = await runShellCommand(abruneggOneDriveCommand, cliOptions, {
                dryRun: options.job.dryRun
            });
            logs.push(... output);

            return { log: logs };
        },
        setup: async (): Promise<Plugin.Output> => {
            const logs: Log.Entry[] = [];

            logs.push({
                content: `Check if the '${abruneggOneDriveCommand}' command can be found`,
                creator: pluginName,
                time: new Date()
            });
            const rsyncFound = await new Promise<boolean>((resolve, reject) => {
                commandExists(abruneggOneDriveCommand, (err, exists) => {
                    if (err) {
                        return reject(err);
                    }
                    logs.push({
                        content: `The '${abruneggOneDriveCommand}' command was found: ${exists}`,
                        creator: pluginName,
                        time: new Date()
                    });
                    return resolve(exists);
                });
            });

            if (!rsyncFound) {
                throw Error(`${pluginName} Plugin: The command '${abruneggOneDriveCommand}' was not found`);
            }

            return { log: logs };
        }
    },
    version: {
        major: 1
    }
};

export default abruneggOneDrivePlugin;
