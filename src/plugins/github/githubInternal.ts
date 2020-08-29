import { exec } from "child_process";
import { promises as fs } from "fs";
import path from "path";


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

const isDirectory = async (dirPath: string): Promise<boolean> => {
    try {
        const stat = await fs.lstat(dirPath);
        return stat.isDirectory();
    } catch (e) {
        return false;
    }
};

const runCliCommand = async (
    command: string, cwd: string, dryRun = false
): Promise<CodeOutput> => new Promise<CodeOutput>((resolve, reject) => {
    if (dryRun) {
        return resolve({ command, cwd, stderr: "", stdout: "" });
    }
    exec(command, { cwd }, (err, stdout, stderr) => {
        if (err) {
            return reject(err);
        }
        resolve({ command, cwd, stderr, stdout });
    });
});

const gitCloneRepo = async (
    token: string, repoDir: string, repoFullName: string, dryRun = false
): Promise<CodeOutput[]> => {
    const codeOutputs: CodeOutput[] = [];
    if (dryRun !== true) {
        await fs.mkdir(repoDir, { recursive: true });
    }
    codeOutputs.push({ command: `mkdir -p ${repoDir}`, stderr: "", stdout: "" });
    codeOutputs.push(await runCliCommand(`git clone "https://${token}@github.com/${repoFullName}.git" "${repoDir}"`,
        path.dirname(repoDir), dryRun));
    codeOutputs.push(await runCliCommand("git fetch --all", repoDir, dryRun));
    codeOutputs.push(await runCliCommand("git pull --all", repoDir, dryRun));
    return codeOutputs;
};

const gitUpdateRepo = async (
    token: string, repoDir: string, repoFullName: string, dryRun = false
): Promise<CodeOutput[]> => {
    try {
        const codeOutputs: CodeOutput[] = [];
        codeOutputs.push(await runCliCommand("git fetch --all", repoDir, dryRun));
        codeOutputs.push(await runCliCommand("git pull --all", repoDir, dryRun));
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
): Promise<CodeOutput[]> => {
    if (await isDirectory(path.join(repoDir, ".git"))) {
        try {
            return await gitUpdateRepo(token, repoDir, repoFullName, dryRun);
        } catch (updateError) {
            throw updateError;
        }
    } else {
        try {
            return await gitCloneRepo(token, repoDir, repoFullName, dryRun);
        } catch (cloneError) {
            if (dryRun !== true) {
                await fs.rmdir(repoDir, { recursive: true });
            }
            throw cloneError;
        }
    }
};

export const getCodeOutputString = (codeOutput: CodeOutput) => {
    let stringBuilder = ">> ";
    if (codeOutput.cwd) {
        stringBuilder += `(${codeOutput.cwd})\n   `;
    }
    stringBuilder += `${codeOutput.command}`;
    if (codeOutput.stdout && codeOutput.stdout.length > 0) {
        stringBuilder += `\n   [stdout] ${codeOutput.stdout.trimEnd()}`;
    }
    if (codeOutput.stderr && codeOutput.stderr.length > 0) {
        stringBuilder += `\n   [stderr] ${codeOutput.stderr.trimEnd()}`;
    }
    return stringBuilder;
};
