import { debuglog } from "util";
import type { Log } from "../../api/log";
import { LogLevel } from "../../api/logLevel";
import { PluginError } from "src/api/error";
import { pluginName } from "../rsync";
import { spawn } from "child_process";


const debug = debuglog("app-plugin-rsync");

const createLogEntry = (content: string, logLevel?: LogLevel) => {
    debug(content);
    return {
        content,
        creator: pluginName,
        level: logLevel !== undefined ? logLevel : LogLevel.INFO,
        time: new Date()
    };
};

export enum RsyncCommands {
    SYNCHRONIZE = "SYNCHRONIZE",
    CUSTOM = "CUSTOM"
}

export const runRsync = async (cliCommand: string, cliOptions: string[]): Promise<Log.Entry[]> => {
    const logs: Log.Entry[] = [];

    logs.push(createLogEntry(`Start subprocess: "${cliCommand} ${cliOptions.join(" ")}"`));
    const subprocess = spawn(cliCommand, cliOptions, { shell: true });

    try {
        await new Promise((resolve, reject) => {
            subprocess.on("error", err => {
                logs.push(createLogEntry(`Failed to start subprocess: ${err.message}\n${JSON.stringify(err)}`,
                    LogLevel.ERROR));
                return reject(err);
            });
            let commandOutput = "";
            subprocess.stdout.on("data", data => {
                const tempString = (data as Buffer).toString();
                commandOutput += tempString;
                debug(tempString.trimEnd());
            });
            subprocess.stderr.on("data", data => {
                const tempString = (data as Buffer).toString();
                commandOutput += tempString;
                debug(tempString.trimEnd());
            });
            subprocess.on("close", exitCode => {
                logs.push(createLogEntry(`Command exit with ${exitCode} and the following output:\n${commandOutput}`,
                    exitCode !== 0 ? LogLevel.ERROR : LogLevel.INFO));
                if (exitCode !== 0) {
                    throw Error(`Process exited with the error code ${exitCode}`);
                }
                return resolve(logs);
            });
        });
    } catch (err) {
        debug(JSON.stringify(err));
        const pluginError: PluginError = err as Error;
        pluginError.message = `Plugin ${pluginName}: ${pluginError.message}`;
        pluginError.logs = logs;
        throw pluginError;
    }

    return logs;
};
