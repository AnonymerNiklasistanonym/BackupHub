import { checkAndCreateBackupDir, commandCanBeFound, createLogEntryGenerator, runShellCommand } from "../api/helper";
import type { Log, Plugin } from "../api/backupHub";
import { debuglog } from "util";
import { promises as fs } from "fs";
import { LogLevel } from "../api/logLevel";
import type { Pacman } from "./pacman/types";
export type { Pacman } from "./pacman/types";
import path from "path";
import { PluginError } from "../api/error";
import { resolveVariableString } from "../api/helper/resolveVariableString";


export const pluginName = "Pacman";
export enum PacmanCommand {
    GET_PACKAGE_LIST_JSON = "GET_PACKAGE_LIST_JSON"
}
export const shellCommand = "pacman";


const debug = debuglog("app-plugin-pacman");
const createLogEntry = createLogEntryGenerator(debug, pluginName);

export interface PacmanPackageEntry {
    validatedBy: string[]
    installScript: string
    replaces: string
    conflictsWith: string
    optionalFor: string[]
    optionalDeps: string[]
    groups: string[]
    architecture: string
    packager: string
    name: string
    version: string
    description: string
    url: string
    licenses: string[]
    provides: string[]
    dependsOn: string[]
    requiredBy: string[]
    installedSize: string
    buildDate: string
    installDate: string
    installReason: string
}

// eslint-disable-next-line complexity
export const parsePacmanPackageEntry = (pacmanOutThing: string): PacmanPackageEntry[] => {
    const outObject: PacmanPackageEntry = {} as PacmanPackageEntry;
    let previousKey = "";
    let empty = true;
    for (const line of pacmanOutThing.split("\n")) {
        const match = /^(\S.*?)\s*:\s*(.*?)\s*$/.exec(line);
        if (match) {
            const value = match[2];
            const key = match[1].toLowerCase().split(" ");
            const finalKey = `${key[0]}${
                key.slice(1).map(keyPart => keyPart.charAt(0).toUpperCase() + keyPart.slice(1)).join("")}`;
            if (finalKey === "architecture") {
                outObject.architecture = value;
            } else if (finalKey === "buildDate") {
                outObject.buildDate = value;
            } else if (finalKey === "conflictsWith") {
                outObject.conflictsWith = value;
            } else if (finalKey === "dependsOn") {
                outObject.dependsOn = value.split("  ");
            } else if (finalKey === "description") {
                outObject.description = value;
            } else if (finalKey === "groups") {
                outObject.groups = value.split("  ");
            } else if (finalKey === "installDate") {
                outObject.installDate = value;
            } else if (finalKey === "installReason") {
                outObject.installReason = value;
            } else if (finalKey === "installScript") {
                outObject.installScript = value;
            } else if (finalKey === "installedSize") {
                outObject.installedSize = value;
            } else if (finalKey === "licenses") {
                outObject.licenses = value.split("  ");
            } else if (finalKey === "name") {
                outObject.name = value;
            } else if (finalKey === "optionalDeps") {
                outObject.optionalDeps = value.split("  ");
            } else if (finalKey === "optionalFor") {
                outObject.optionalFor = value.split("  ");
            } else if (finalKey === "packager") {
                outObject.packager = value;
            } else if (finalKey === "provides") {
                outObject.provides = value.split("  ");
            } else if (finalKey === "replaces") {
                outObject.replaces = value;
            } else if (finalKey === "requiredBy") {
                outObject.requiredBy = value.split("  ");
            } else if (finalKey === "validatedBy") {
                outObject.validatedBy = value.split("  ");
            } else if (finalKey === "version") {
                outObject.version = value;
            } else if (finalKey === "url") {
                outObject.url = value;
            } else {
                throw Error(`Unknown pacman key was found: '${finalKey}'/'${value}'/\n${pacmanOutThing}`);
            }
            previousKey = finalKey;
        } else if (previousKey !== "") {
            const value = line.trim();
            // If no match append to previous key value
            if (previousKey === "dependsOn") {
                outObject.dependsOn.push(... value.split("  "));
            } else if (previousKey === "groups") {
                outObject.groups.push(... value.split("  "));
            } else if (previousKey === "licenses") {
                outObject.licenses = value.split("  ");
            } else if (previousKey === "optionalDeps") {
                outObject.optionalDeps.push(... value.split("  "));
            } else if (previousKey === "optionalFor") {
                outObject.optionalFor.push(... value.split("  "));
            } else if (previousKey === "provides") {
                outObject.provides.push(... value.split("  "));
            } else if (previousKey === "requiredBy") {
                outObject.requiredBy.push(... value.split("  "));
            } else if (previousKey === "validatedBy") {
                outObject.validatedBy.push(... value.split("  "));
            } else {
                throw Error(`Unexpected key was found: '${previousKey}'`);
            }
        } else {
            // Skip everything - empty string was found
            continue;
        }
        empty = false;
    }
    if (Object.getOwnPropertyNames(outObject).length === 0) {
        return [];
    }
    return empty ? [] : [outObject];
};

const pacmanPlugin: Plugin = {
    name: pluginName,
    routines: {
        // eslint-disable-next-line complexity
        runInstruction: async (options, instruction): Promise<Plugin.Output> => {
            const logs: Log.Entry[] = [];
            const pacmanInstruction = instruction as Pacman.Instruction;

            try {

                const cliOptions: string[] = ["-Qei"];
                if (pacmanInstruction.command === PacmanCommand.GET_PACKAGE_LIST_JSON) {
                    // Set nothing
                }

                const sourceDir = resolveVariableString(options.globals.variables, options.job.sourceDir);
                if (Array.isArray(sourceDir)) {
                    const errorMessage = `Source directory (${
                        options.job.sourceDir}) resolved to more than one path:\n${
                        JSON.stringify(sourceDir)}`;
                    logs.push(createLogEntry(errorMessage, LogLevel.ERROR));
                    throw Error(errorMessage);
                }

                const output = await runShellCommand(shellCommand, cliOptions, {
                    cwd: sourceDir,
                    dryRun: options.job.dryRun
                });
                logs.push(... output.logs);

                const pacmanCliOutputPackages = output.output.split("\n\n");
                logs.push(createLogEntry("pacmanCliOutputPackages: "
                    + JSON.stringify(pacmanCliOutputPackages), LogLevel.DEBUG));

                const pacmanPackages = pacmanCliOutputPackages.reduce(
                    (prev, curr) => prev.concat(parsePacmanPackageEntry(curr)), [] as PacmanPackageEntry[]);
                logs.push(createLogEntry("pacmanPackages: "
                    + JSON.stringify(pacmanPackages), LogLevel.DEBUG));

                const bigBoy = JSON.stringify(pacmanPackages, null, 4);
                logs.push(createLogEntry("bigBoy: "
                    + JSON.stringify(bigBoy), LogLevel.DEBUG));

                let jsonOutputFilePaths = resolveVariableString(options.globals.variables,
                    pacmanInstruction.options.jsonOutputFilePaths);
                if (!Array.isArray(jsonOutputFilePaths)) {
                    jsonOutputFilePaths = [jsonOutputFilePaths];
                }

                for (const jsonOutputFilePath of jsonOutputFilePaths) {
                    logs.push(createLogEntry("directory: "
                    + path.dirname(jsonOutputFilePath) + " (" + jsonOutputFilePath + ")", LogLevel.DEBUG));
                    // Check if each backup directory exists or can be created
                    const backupDirStatus = await checkAndCreateBackupDir(path.dirname(jsonOutputFilePath), {
                        dryRun: options.job.dryRun
                    });
                    logs.push(... backupDirStatus.logs);
                    if (!backupDirStatus.exists) {
                        continue;
                    }
                    try {
                        if (!options.job.dryRun) {
                            await fs.writeFile(jsonOutputFilePath, bigBoy);
                        }
                        logs.push(createLogEntry(`Pacman output was written to: ${jsonOutputFilePath}`));
                    } catch (err) {
                        const errorMessage = `There was a problem creating the file: ${jsonOutputFilePath}`;
                        logs.push(createLogEntry(errorMessage, LogLevel.ERROR));
                        throw err;
                    }
                }

            } catch (err) {
                const pluginError: PluginError = err as Error;
                pluginError.message = `Plugin ${pluginName}: ${pluginError.message}`;
                const errLogs = (err as PluginError)?.logs;
                pluginError.logs = errLogs !== undefined ? logs.concat(errLogs) : logs;
                pluginError.logs.push(createLogEntry(pluginError.message, LogLevel.ERROR));
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
                const errLogs = (err as PluginError)?.logs;
                pluginError.logs = errLogs !== undefined ? logs.concat(errLogs) : logs;
                pluginError.logs.push(createLogEntry(pluginError.message, LogLevel.ERROR));
                throw pluginError;
            }

            return { log: logs };
        }
    },
    version: {
        major: 1
    }
};

export default pacmanPlugin;
