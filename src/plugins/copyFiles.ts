import {
    checkAndCreateBackupDir, createLogEntryGenerator, resolveVariableString
} from "../api/helper";
import type { CopyFiles } from "./copyFiles/types";
export type { CopyFiles } from "./copyFiles/types";
import { debuglog } from "util";
import { promises as fs } from "fs";
import fsExtra from "fs-extra";
import glob from "glob";
import type { Log } from "../api/log";
import { LogLevel } from "../api/logLevel";
import path from "path";
import type { Plugin } from "../api/plugin";
import { PluginError } from "../api/error";



export const pluginName = "CopyFiles";
export enum CopyFilesCommand {
    COPY = "COPY"
}
export const shellCommand = "copyFiles";


const debug = debuglog("app-plugin-copyFiles");
const createLogEntry = createLogEntryGenerator(debug, pluginName);


const copyFilesPlugin: Plugin = {
    name: pluginName,
    routines: {
        // eslint-disable-next-line complexity
        runInstruction: async (options, instruction): Promise<Plugin.Output> => {
            const logs: Log.Entry[] = [];

            try {

                const copyFilesInstruction = instruction as CopyFiles.Instruction;
                logs.push(createLogEntry(JSON.stringify(copyFilesInstruction), LogLevel.DEBUG));

                if (copyFilesInstruction.command === CopyFilesCommand.COPY) {
                    // Nothing to do right now
                } else {
                    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                    throw Error(`The command '${copyFilesInstruction.command}' is not supported`);
                }

                // Resolve source dir path
                const sourceDir = resolveVariableString(options.globals.variables, options.job.sourceDir);
                if (Array.isArray(sourceDir)) {
                    const errorMessage = `Source directory (${
                        options.job.sourceDir}) resolved to more than one path:\n${
                        JSON.stringify(sourceDir)}`;
                    logs.push(createLogEntry(errorMessage, LogLevel.ERROR));
                    throw Error(errorMessage);
                }

                // Resolve source file paths
                let sourceFiles = resolveVariableString(options.globals.variables,
                    copyFilesInstruction.options.sourceFiles);
                if (!Array.isArray(sourceFiles)) {
                    sourceFiles = [sourceFiles];
                }
                if (copyFilesInstruction.options.glob) {
                    const globCommands = sourceFiles.slice();
                    sourceFiles = [];
                    for (const globCommand of globCommands) {
                        const globbedFiles = await new Promise<string[]>((resolve, reject) => {
                            logs.push(createLogEntry(`Glob command: '${globCommand}'`, LogLevel.DEBUG));
                            glob(globCommand, {
                                absolute: true,
                                cwd: copyFilesInstruction.options.cwd
                                    ? copyFilesInstruction.options.cwd : path.join(__dirname, "..", "..", "..")
                            }, (err, files) => {
                                if (err) {
                                    return reject(err);
                                }
                                return resolve(files);
                            });
                        });
                        logs.push(createLogEntry(`The glob command '${globCommand}' resolved to the files:\n${
                            globbedFiles.join("\n")}`, LogLevel.INFO));
                        sourceFiles.push(... globbedFiles);
                    }
                }

                // Resolve backup directories
                let backupDirs = resolveVariableString(options.globals.variables,
                    copyFilesInstruction.options.backupDirs);
                if (!Array.isArray(backupDirs)) {
                    backupDirs = [backupDirs];
                }
                for (const backupDir of backupDirs) {
                    if (copyFilesInstruction.options.deleteBackupDir) {
                        logs.push(createLogEntry(`Remove directory '${backupDir}'`));
                        if (!options.job.dryRun) {
                            await fs.rmdir(backupDir, { recursive: true });
                        }
                    }

                    // Check if each backup directory exists or can be created
                    const backupDirStatus = await checkAndCreateBackupDir(backupDir, {
                        dryRun: options.job.dryRun
                    });
                    logs.push(... backupDirStatus.logs);
                    if (!backupDirStatus.exists) {
                        continue;
                    }

                    for (const sourceFile of sourceFiles) {
                        try {
                            logs.push(createLogEntry(`What is this: '${
                                path.relative(sourceDir, sourceFile)}', sourceDir='${
                                sourceDir}', sourceFile='${sourceFile}'`));
                            const destFilePath = path.join(backupDir, path.relative(sourceDir, sourceFile));
                            logs.push(createLogEntry(`Copy '${sourceFile}' to '${destFilePath}'`));
                            if (!options.job.dryRun) {
                                await fsExtra.copy(sourceFile, destFilePath);
                            }
                        } catch (err) {
                            logs.push(createLogEntry(`Copy of '${sourceFile}' to '${backupDir}' failed: ${
                                (err as Error).message}`, LogLevel.ERROR));
                            throw err;
                        }
                    }
                }
            } catch (err) {
                const pluginError: PluginError = err as Error;
                pluginError.message = `Plugin ${pluginName}: ${pluginError.message}`;
                pluginError.logs = logs;
                throw pluginError;
            }

            return { log: logs };
        }
    },
    version: {
        major: 1
    }
};

export default copyFilesPlugin;
