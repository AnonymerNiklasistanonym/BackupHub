import { createLogEntryGenerator } from "./createLogEntryGenerator";
import { debuglog } from "util";
import type { Log } from "../log";
import { LogLevel } from "../logLevel";
import { PluginError } from "../error";
import { spawn } from "child_process";

const debug = debuglog("app-helper-runShellCommand");
const createLogEntry = createLogEntryGenerator(debug, "Helper:RunShellCommand");

export const runShellCommand = async (cliCommand: string, cliArgs?: string[]): Promise<Log.Entry[]> => {
    const logs: Log.Entry[] = [];


    let completeCommand = cliCommand;
    if (cliArgs !== undefined && cliArgs.length > 0) {
        completeCommand += ` ${cliArgs.join(" ")}`;
    }

    logs.push(createLogEntry(`Start subprocess: "${completeCommand}"`));
    const subprocess = spawn(cliCommand, cliArgs, { shell: true });

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
        pluginError.logs = logs;
        throw pluginError;
    }

    return logs;
};
