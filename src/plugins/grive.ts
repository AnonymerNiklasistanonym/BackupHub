import { GriveCommands, runGrive } from "./grive/grive";
import type { Log, Plugin } from "../api/backupHub";
import commandExists from "command-exists";
import type { Grive } from "./grive/types";
import { resolveVariableString } from "../api/helper/resolveVariableString";
export type { Grive } from "./grive/types";
export { GriveCommands } from "./grive/grive";


export const pluginName = "Grive";
export const griveCommand = "grive";

const grivePlugin: Plugin = {
    name: pluginName,
    routines: {
        // eslint-disable-next-line complexity
        runInstruction: async (options, instruction): Promise<Plugin.Output> => {
            const logs: Log.Entry[] = [];
            const griveInstruction = instruction as Grive.Instruction;

            const cliOptions: string[] = [];
            if (griveInstruction.command === GriveCommands.CUSTOM) {
                // Set nothing
            } else if (griveInstruction.command === GriveCommands.SYNCHRONIZE) {
                // Nothing special right now
            }
            if (griveInstruction.options.progressBar === true) {
                cliOptions.push("--progress-bar");
            }
            if (griveInstruction.options.verbose === true) {
                cliOptions.push("--verbose");
            }

            const googleDriveDir = resolveVariableString(options.globals.variables,
                griveInstruction.options.googleDriveDir);
            if (Array.isArray(googleDriveDir)) {
                throw Error(`Grive Plugin: Google Drive directory (${
                    griveInstruction.options.googleDriveDir}) resolved to more than one path:\n${
                    JSON.stringify(googleDriveDir)}`);
            }

            const output = await runGrive(griveCommand, cliOptions, googleDriveDir);
            logs.push(... output);

            return { log: logs };
        },
        setup: async (): Promise<Plugin.Output> => {
            const logs: Log.Entry[] = [];

            logs.push({
                content: `Check if the '${griveCommand}' command can be found`,
                creator: pluginName,
                time: new Date()
            });
            const rsyncFound = await new Promise<boolean>((resolve, reject) => {
                commandExists(griveCommand, (err, exists) => {
                    if (err) {
                        return reject(err);
                    }
                    logs.push({
                        content: `The '${griveCommand}' command was found: ${exists}`,
                        creator: pluginName,
                        time: new Date()
                    });
                    return resolve(exists);
                });
            });

            if (!rsyncFound) {
                throw Error(`${pluginName} Plugin: The command '${griveCommand}' was not found`);
            }

            return { log: logs };
        }
    },
    version: {
        major: 1
    }
};

export default grivePlugin;
