import type { Log } from "../../api/log";
import { LogLevel } from "../../api/logLevel";
import { pluginName } from "../rsync";
import type { Rsync } from "./index";
export type { Rsync } from "./index";
import { spawn } from "child_process";


export enum Commands {
    SYNC = "sync"
}

export const runRsync = async (cliCommand: string, cliOptions: string[]): Promise<Log.Entry[]> => {
    const logs: Log.Entry[] = [];

    console.info(cliOptions);
    logs.push({
        content: `Start subprocess: "${cliCommand} ${cliOptions.join(" ")}"`,
        creator: pluginName,
        level: LogLevel.ERROR,
        time: new Date()
    });
    console.info(logs);
    const subprocess = spawn(cliCommand, cliOptions, { shell: true });

    await new Promise((resolve, reject) => {
        subprocess.on("error", (err) => {
            logs.push({
                content: `Failed to start subprocess: ${err.message}`,
                creator: pluginName,
                level: LogLevel.ERROR,
                time: new Date()
            });
            return reject(err);
        });
        let commandOutput = "";
        subprocess.stdout.on("data", (data) => {
            commandOutput += (data as Buffer).toString();
        });
        subprocess.stderr.on("data", (data) => {
            commandOutput += (data as Buffer).toString();
            console.warn((data as Buffer).toString());
        });
        subprocess.on("close", (code) => {
            logs.push({
                content: `Command exit with ${code} and the following output:\n${commandOutput}`,
                creator: pluginName,
                level: LogLevel.INFO,
                time: new Date()
            });
            if (code !== 0) {
                throw Error(`Rsync Plugin: Process exited with the error code ${code}`);
            }
            return resolve(logs);
        });
    });

    return logs;
};
