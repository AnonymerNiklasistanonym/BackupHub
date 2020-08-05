import { debuglog } from "util";
import type { Log } from "../../api/log";
import { LogLevel } from "../../api/logLevel";
import { pluginName } from "../rsync";
import { spawn } from "child_process";


const debug = debuglog("app-plugin-rsync");


export enum RsyncCommands {
    SYNCHRONIZE = "SYNCHRONIZE",
    CUSTOM = "CUSTOM"
}

export const runRsync = async (cliCommand: string, cliOptions: string[]): Promise<Log.Entry[]> => {
    const logs: Log.Entry[] = [];

    debug(`Start subprocess: "${cliCommand} ${cliOptions.join(" ")}"`);
    logs.push({
        content: `Start subprocess: "${cliCommand} ${cliOptions.join(" ")}"`,
        creator: pluginName,
        level: LogLevel.INFO,
        time: new Date()
    });
    const subprocess = spawn(cliCommand, cliOptions, { shell: true });

    try {
        await new Promise((resolve, reject) => {
            subprocess.on("error", (err) => {
                logs.push({
                    content: `Failed to start subprocess: ${err.message}`,
                    creator: pluginName,
                    level: LogLevel.ERROR,
                    time: new Date()
                });
                debug(JSON.stringify(err));
                return reject(err);
            });
            let commandOutput = "";
            subprocess.stdout.on("data", (data) => {
                commandOutput += (data as Buffer).toString();
                debug((data as Buffer).toString());
            });
            subprocess.stderr.on("data", (data) => {
                commandOutput += (data as Buffer).toString();
                debug((data as Buffer).toString());
            });
            subprocess.on("close", (code) => {
                debug(`Command exit with ${code} and the following output:\n${commandOutput}`);
                logs.push({
                    content: `Command exit with ${code} and the following output:\n${commandOutput}`,
                    creator: pluginName,
                    level: LogLevel.INFO,
                    time: new Date()
                });
                if (code !== 0) {
                    throw Error(`${pluginName} Plugin: Process exited with the error code ${code}`);
                }
                return resolve(logs);
            });
        });
    } catch (err) {
        debug(JSON.stringify(err));
        throw err;
    }

    return logs;
};
