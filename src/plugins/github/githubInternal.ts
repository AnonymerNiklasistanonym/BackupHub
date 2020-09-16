import {
    createLogEntryGenerator, directoryExists, runShellCommand
} from "../../api/helper";
import { debuglog } from "util";
import { promises as fs } from "fs";
import { Log } from "../../api/log";
import { LogLevel } from "../../api/logLevel";
import path from "path";
import { pluginName } from "../github";


const debug = debuglog("app-plugin-github-internal");
const createLogEntry = createLogEntryGenerator(debug, pluginName);


export interface GitHubRepoInfo {
    owner: { login: string }
    name: string
    // eslint-disable-next-line camelcase
    full_name: string
    // eslint-disable-next-line camelcase
    has_wiki: boolean
}

interface CodeOutput {
    command: string
    cwd?: string
    stdout: string
    stderr: string
}

const gitCloneRepo = async (
    token: string, repoDir: string, repoFullName: string, dryRun = false
): Promise<Log.Entry[]> => {
    const codeOutputs: Log.Entry[] = [];
    codeOutputs.push(createLogEntry(`Create directory "${repoDir}"`, LogLevel.DEBUG));
    if (dryRun !== true) {
        await fs.mkdir(repoDir, { recursive: true });
    }
    codeOutputs.push(... (await runShellCommand("git", [
        "clone", `https://${token}@github.com/${repoFullName}.git`, repoDir
    ], { cwd: path.dirname(repoDir), dryRun })).logs);
    codeOutputs.push(... (await runShellCommand("git", [
        "fetch", "--all"
    ], { cwd: repoDir, dryRun })).logs);
    codeOutputs.push(... (await runShellCommand("git", [
        "pull", "--all"
    ], { cwd: repoDir, dryRun })).logs);
    return codeOutputs;
};

const gitUpdateRepo = async (
    token: string, repoDir: string, repoFullName: string, dryRun = false
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
        return await gitCloneRepo(token, repoDir, repoFullName, dryRun);
    }
};

export const gitBackupRepo = async (
    repoDir: string, token: string, repoFullName: string, dryRun = false
): Promise<Log.Entry[]> => {
    const codeOutputs: Log.Entry[] = [];
    codeOutputs.push(createLogEntry(`Create directory "${repoDir}"`, LogLevel.DEBUG));
    if (await directoryExists(path.join(repoDir, ".git"))) {
        try {
            codeOutputs.push(... await gitUpdateRepo(token, repoDir, repoFullName, dryRun));
            return codeOutputs;
        } catch (updateError) {
            throw updateError;
        }
    } else {
        try {
            codeOutputs.push(... await gitCloneRepo(token, repoDir, repoFullName, dryRun));
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
