import type { Log } from "../../api/log";
import { LogLevel } from "../../api/logLevel";
import { pluginName } from "../grive";
import { spawn } from "child_process";


export enum GriveCommands {
    SYNCHRONIZE = "SYNCHRONIZE",
    CUSTOM = "CUSTOM"
}

export const runGrive = async (
    cliCommand: string, cliOptions: string[], googleDriveDir: string
): Promise<Log.Entry[]> => {
    const logs: Log.Entry[] = [];

    logs.push({
        content: `Start subprocess: "${cliCommand} ${cliOptions.join(" ")}"`,
        creator: pluginName,
        level: LogLevel.INFO,
        time: new Date()
    });
    const subprocess = spawn(cliCommand, cliOptions, { cwd: googleDriveDir, shell: true });

    try {
        await new Promise((resolve, reject) => {
            subprocess.on("error", (err) => {
                logs.push({
                    content: `Failed to start subprocess: ${err.message}`,
                    creator: pluginName,
                    level: LogLevel.ERROR,
                    time: new Date()
                });
                return reject(Error(`${pluginName} Plugin: Failed to start subprocess\n${err.message}`));
            });
            let commandOutput = "";
            subprocess.stdout.on("data", (data) => {
                commandOutput += (data as Buffer).toString();
            });
            subprocess.stderr.on("data", (data) => {
                commandOutput += (data as Buffer).toString();
            });
            subprocess.on("close", (code) => {
                logs.push({
                    content: `Command exit with ${code} and the following output:\n${commandOutput}`,
                    creator: pluginName,
                    level: LogLevel.INFO,
                    time: new Date()
                });
                if (code !== 0) {
                    return reject(Error(`${pluginName} Plugin: Process exited with the error code ${code}`));
                }
                return resolve(logs);
            });
        });
    } catch (err) {
        throw err;
    }

    return logs;
};
