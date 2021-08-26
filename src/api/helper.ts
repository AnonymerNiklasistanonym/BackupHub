export { fileExists, directoryExists } from "./helper/fileExists";
export { checkAndCreateBackupDir } from "./helper/checkAndCreateBackupDir";
export { createLogEntryGenerator } from "./helper/createLogEntryGenerator";
export { commandCanBeFound } from "./helper/commandCanBeFound";
export { logFormatter } from "./helper/logFormatter";
export { resolveVariableString } from "./helper/resolveVariableString";
export { runShellCommand } from "./helper/runShellCommand";
import type { Plugin } from "../api/backupHub";

export const createVersionStringPlugin = (pluginVersionNumber: Plugin.Info.Version): string => {
    return `${pluginVersionNumber.major}.${
        pluginVersionNumber.minor ? pluginVersionNumber.minor : 0}.${
        pluginVersionNumber.patch ? pluginVersionNumber.patch : 0}`;
};
