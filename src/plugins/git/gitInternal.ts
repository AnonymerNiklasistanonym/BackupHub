import {
    createLogEntryGenerator, directoryExists, runShellCommand
} from "../../api/helper";
import { debuglog } from "util";
import { promises as fs } from "fs";
import { Log } from "../../api/log";
import { LogLevel } from "../../api/logLevel";
import path from "path";


const debug = debuglog("app-plugin-git-internal");
const createLogEntry = createLogEntryGenerator(debug, "Helper:Git");


export const gitCloneRepo = async (
    token: string|undefined, baseUrl: string, repoDir: string, repoFullName: string, dryRun = false
): Promise<Log.Entry[]> => {
    const codeOutputs: Log.Entry[] = [];
    codeOutputs.push(createLogEntry(`Create directory "${repoDir}"`, LogLevel.DEBUG));
    if (dryRun !== true) {
        await fs.mkdir(repoDir, { recursive: true });
    }
    try {
        const cloneUrlTokenPrefix = token ? `${token}@` : "";
        codeOutputs.push(... (await runShellCommand("git", [
            "clone", `https://${cloneUrlTokenPrefix}${baseUrl}/${repoFullName}.git`, repoDir
        ], { cwd: path.dirname(repoDir), dryRun })).logs);
        codeOutputs.push(... (await runShellCommand("git", [
            "fetch", "--all"
        ], { cwd: repoDir, dryRun })).logs);
        codeOutputs.push(... (await runShellCommand("git", [
            "pull", "--all"
        ], { cwd: repoDir, dryRun })).logs);
    } catch (error) {
        throw error;
    }
    return codeOutputs;
};

export const gitUpdateRepo = async (
    token: string|undefined, baseUrl: string, repoDir: string, repoFullName: string, dryRun = false
): Promise<Log.Entry[]> => {
    try {
        const codeOutputs: Log.Entry[] = [];
        codeOutputs.push(... (await runShellCommand("git", [
            "fetch", "--all"
        ], { cwd: repoDir, dryRun })).logs);
        codeOutputs.push(... (await runShellCommand("git", [
            "pull", "--all"
        ], { cwd: repoDir, dryRun })).logs);
        return codeOutputs;
    } catch (updateError) {
        if (dryRun !== true) {
            await fs.rmdir(repoDir, { recursive: true });
        }
        return await gitCloneRepo(token, baseUrl, repoDir, repoFullName, dryRun);
    }
};

export const gitBackupRepo = async (
    repoDir: string, baseUrl: string, token: string|undefined, repoFullName: string, dryRun = false
): Promise<Log.Entry[]> => {
    const codeOutputs: Log.Entry[] = [];
    codeOutputs.push(createLogEntry(`Create directory "${repoDir}"`, LogLevel.DEBUG));
    if (await directoryExists(path.join(repoDir, ".git"))) {
        try {
            codeOutputs.push(... await gitUpdateRepo(token, baseUrl, repoDir, repoFullName, dryRun));
            return codeOutputs;
        } catch (updateError) {
            throw updateError;
        }
    } else {
        try {
            codeOutputs.push(... await gitCloneRepo(token, baseUrl, repoDir, repoFullName, dryRun));
            return codeOutputs;
        } catch (cloneError) {
            codeOutputs.push(createLogEntry(`Remove directory "${repoDir}"`, LogLevel.DEBUG));
            if (dryRun !== true) {
                await fs.rmdir(repoDir, { recursive: true });
            }
            throw cloneError;
        }
    }
};
