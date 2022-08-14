import { BackupHubError, PluginError } from "./error";
import type { Config } from "./config";
export type { Config } from "./config";
import { createLogEntryGenerator } from "./helper";
import { debuglog } from "util";
export type { Instruction } from "./instruction";
import type { Job } from "./job";
export type { Job } from "./job";
import type { Log } from "./log";
import { LogLevel } from "./logLevel";
export type { Log } from "./log";
import type { Plugin } from "./plugin";
export type { Plugin } from "./plugin";

const debug = debuglog("app-api");
const createLogEntry = createLogEntryGenerator(debug, "Api");

export const backupHubName = "backup-hub";
export const backupHubVersionMajor = 1;
export const backupHubVersionMinor = 0;
export const backupHubVersionPatch = 2;
export const backupHubVersion = `${backupHubVersionMajor}.${backupHubVersionMinor}.${backupHubVersionPatch}`;

export class BackupHup {
    private jobs: Job[] = [];
    private plugins: Plugin<Job.DefaultDataSourceDir>[] = [];
    private variables: Config.Globals.Variable[] = [];
    private methods: Config.Globals.Method[] = [];

    public name = backupHubName;
    public versionMajor = backupHubVersionMajor;
    public versionMinor = backupHubVersionMinor;
    public versionPatch = backupHubVersionPatch;
    public version = backupHubVersion;

    /**
     * Add a plugin that can then be referenced in jobs
     *
     * @param plugin The plugin to be added
     * @returns Log messages
     */
    public async addPlugin (plugin: Plugin<Job.DefaultDataSourceDir>): Promise<Log.Entry[]> {
        const logs: Log.Entry[] = [];

        // Replace previous plugin with the same name if found
        const indexToRemove = this.plugins.findIndex(x => x.name === plugin.name);
        if (indexToRemove > -1) {
            this.plugins.splice(indexToRemove, 1);
        }

        // Add plugin to the list of plugins so that it can be found when running jobs
        this.plugins.push(plugin);
        logs.push(createLogEntry(`Plugin ${plugin.name} (v${plugin.version}) was added`,
            LogLevel.INFO));

        // If the plugin has a test routine run it
        if (plugin.routines.test) {
            logs.push(createLogEntry(`Run plugin test routine of ${plugin.name}`,
                LogLevel.DEBUG));
            try {
                const setupOutput = await plugin.routines.test({
                    globals: {
                        methods: this.methods,
                        variables: this.variables
                    }
                });
                logs.push(... setupOutput.log);
            } catch (err) {
                const backupHubError: BackupHubError = {
                    ... err as Error, backupHubVersion: this.version
                };
                backupHubError.message = `Test routine of ${plugin.name} exited with an error: ${
                    backupHubError.message}`;
                const errLogs = (err as PluginError)?.logs;
                backupHubError.logs = errLogs !== undefined ? logs.concat(errLogs) : logs;
                backupHubError.logs.push(createLogEntry(backupHubError.message,
                    LogLevel.ERROR));
                throw backupHubError;
            }
        }

        // If the plugin has a setup routine run it
        if (plugin.routines.setup) {
            logs.push(createLogEntry(`Run plugin setup routine of ${plugin.name}`,
                LogLevel.DEBUG));
            try {
                const setupOutput = await plugin.routines.setup({
                    globals: {
                        methods: this.methods,
                        variables: this.variables
                    }
                });
                logs.push(... setupOutput.log);
            } catch (err) {
                const backupHubError: BackupHubError = {
                    ... err as Error, backupHubVersion: this.version
                };
                backupHubError.message = `Setup routine of ${plugin.name} exited with an error: ${
                    backupHubError.message}`;
                const errLogs = (err as BackupHubError)?.logs;
                backupHubError.logs = errLogs !== undefined ? logs.concat(errLogs) : logs;
                backupHubError.logs.push(createLogEntry(backupHubError.message,
                    LogLevel.ERROR));
                throw backupHubError;
            }
        }

        return logs;
    }

    /**
     * Add a global variable that can then be referenced in jobs
     *
     * @param variable The variable to be added
     */
    public addGlobalVariable (variable: Config.Globals.Variable): void {
        // Remove previous variable if existing
        const indexToRemove = this.variables.findIndex(x => x.name === variable.name);
        if (indexToRemove > -1) {
            this.variables.splice(indexToRemove, 1);
        }
        this.variables.push(variable);
    }

    /**
     * Add a global method that can then be referenced in jobs
     *
     * @param method The method to be added
     */
    public addGlobalMethod (method: Config.Globals.Method): void {
        // Remove previous method if existing
        const indexToRemove = this.methods.findIndex(x => x.name === method.name);
        if (indexToRemove > -1) {
            this.methods.splice(indexToRemove, 1);
        }
        this.methods.push(method);
    }

    /**
     * Add a job that can then be run when running runJobs()
     *
     * @param job The job to be added
     */
    public addJob (job: Job): void {
        // Remove previous method if existing
        const indexToRemove = this.jobs.findIndex(x => x.name === job.name);
        if (indexToRemove > -1) {
            this.methods.splice(indexToRemove, 1);
        }
        this.jobs.push(job);
    }

    /**
     * Run all added jobs
     *
     * @returns Job output information
     */
    public async runJobs (): Promise<Job.Output[]> {
        const jobOutputs: Job.Output[] = [];
        const logs: Log.Entry[] = [];

        try {
            logs.push(createLogEntry("Run all jobs", LogLevel.DEBUG));
            jobOutputs.push({ log: logs });
            const jobPromises = this.jobs.map(async job => {
                const jobOutput = await this.runJob(job);
                jobOutputs.push(jobOutput);
                return jobOutput;
            });
            await Promise.all(jobPromises);
        } catch (err) {
            const backupHubError: BackupHubError = {
                ... err as Error, backupHubVersion: this.version
            };
            backupHubError.message = `Running all jobs exited with an error: ${
                backupHubError.message}`;
            const errLogs = (err as BackupHubError)?.logs;
            backupHubError.logs = errLogs !== undefined ? logs.concat(errLogs) : logs;
            backupHubError.logs.push(createLogEntry(backupHubError.message,
                LogLevel.ERROR));
            throw backupHubError;
        }

        return jobOutputs;
    }

    /**
     * Run a job
     *
     * @param job The job to be run
     * @returns Job output information
     */
    public async runJob (job: Job): Promise<Job.Output> {
        const logs: Log.Entry[] = [];

        logs.push(createLogEntry(`Run the job '${job.name}'` + (job.description
            ? ` (${job.description})` : ""), LogLevel.INFO));
        for (const instruction of job.instructions) {
            const indexOfPlugin = this.plugins.findIndex(x => x.name === instruction.plugin);
            if (indexOfPlugin > -1) {
                try {
                    const output = await this.plugins[indexOfPlugin].routines.runInstruction({
                        globals: {
                            methods: this.methods,
                            variables: this.variables.concat({
                                name: "SOURCE_DIR",
                                value: job.data.sourceDir
                            }, {
                                name: "BACKUP_DIR",
                                value: job.data.backupDirs
                            })
                        },
                        job: job.data
                    }, instruction);
                    logs.push(... output.log);
                } catch (err) {
                    const backupHubError: BackupHubError = {
                        ... err as Error, backupHubVersion: this.version
                    };
                    backupHubError.message = `Job ${job.name} exited with an error: ${
                        backupHubError.message}`;
                    const errLogs = (err as BackupHubError)?.logs;
                    backupHubError.logs = errLogs !== undefined ? logs.concat(errLogs) : logs;
                    backupHubError.logs.push(createLogEntry(backupHubError.message,
                        LogLevel.ERROR));
                    throw backupHubError;
                }
            } else {
                throw Error(`The plugin '${instruction.plugin}' was not found (job: ${job.name})`);
            }
        }
        return {
            log: logs
        };
    }
}

export default new BackupHup();
