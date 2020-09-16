import { createLogEntryGenerator } from "./createLogEntryGenerator";
import { debuglog } from "util";
import type { Log } from "../log";
import { LogLevel } from "../logLevel";
import { PluginError } from "../error";
import { spawn } from "child_process";

const debug = debuglog("app-helper-runShellCommand");
const createLogEntry = createLogEntryGenerator(debug, "Helper:RunShellCommand");

export interface RunShellCommandOptions {
    cwd?: string
    dryRun?: boolean
}

export const runShellCommand = async (
    cliCommand: string, cliArgs?: string[], options: RunShellCommandOptions = {}
): Promise<{ logs: Log.Entry[]; output: string }> => {
    const logs: Log.Entry[] = [];

    let completeCommand = cliCommand;
    if (cliArgs !== undefined && cliArgs.length > 0) {
        cliArgs = cliArgs.map(cliArg => `'${cliArg}'`);
        completeCommand += ` ${cliArgs.join(" ")}`;
    }

    let commandInfo = "";
    if (options.cwd !== undefined) {
        commandInfo += ` in '${options.cwd}'`;
    }

    logs.push(createLogEntry(`Start subprocess: "${completeCommand}"${commandInfo}`, LogLevel.DEBUG));
    if (options.dryRun) {
        return { logs, output: "" };
    }
    const subprocess = spawn(cliCommand, cliArgs, { cwd: options.cwd, shell: true });

    try {
        const output = await new Promise<string>((resolve, reject) => {
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
                    exitCode !== 0 ? LogLevel.ERROR : LogLevel.DEBUG));
                if (exitCode !== 0) {
                    return reject(Error(`Process exited with the error code ${exitCode}`));
                }
                return resolve(commandOutput);
            });
        });
        return { logs, output };
    } catch (err) {
        debug(JSON.stringify(err));
        const pluginError: PluginError = err as Error;
        pluginError.logs = logs;
        throw pluginError;
    }

};
