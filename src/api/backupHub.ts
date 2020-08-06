import type { Config } from "./config";
export type { Config } from "./config";
// import type { Instruction } from "./instruction";
export type { Instruction } from "./instruction";
import type { Job } from "./job";
export type { Job } from "./job";
import type { Log } from "./log";
export type { Log } from "./log";
import type { Plugin } from "./plugin";
export type { Plugin } from "./plugin";


export class BackupHup {
    private plugins: Plugin<any>[] = [];
    private variables: Config.Globals.Variable[] = [];
    private methods: Config.Globals.Method<any[], any>[] = [];

    public version = "1.0.0";

    // eslint-disable-next-line @typescript-eslint/require-await
    public async addPlugin (plugin: Plugin): Promise<Log.Entry[]> {
        // Remove previous plugin if existing
        const indexToRemove = this.plugins.findIndex(x => x.name === plugin.name);
        if (indexToRemove > -1) {
            this.plugins.splice(indexToRemove, 1);
        }

        this.plugins.push(plugin);

        // Setup plugin if possible
        const logs: Log.Entry[] = [];
        if (plugin.routines.setup) {
            const output = await plugin.routines.setup({
                globals: {
                    methods: this.methods,
                    variables: this.variables
                }
            });
            logs.push(... output.log);
        }

        return logs;
    }

    public addGlobalVariable (variable: Config.Globals.Variable): void {
        // Remove previous variable if existing
        const indexToRemove = this.variables.findIndex(x => x.name === variable.name);
        if (indexToRemove > -1) {
            this.variables.splice(indexToRemove, 1);
        }

        this.variables.push(variable);
    }

    public addGlobalMethod (method: Config.Globals.Method<any, any>): void {
        // Remove previous method if existing
        const indexToRemove = this.methods.findIndex(x => x.name === method.name);
        if (indexToRemove > -1) {
            this.methods.splice(indexToRemove, 1);
        }

        this.methods.push(method);
    }

    // eslint-disable-next-line @typescript-eslint/require-await
    public async runJob<JOB_DATA> (job: Job): Promise<Job.Output> {
        const logs: Log.Entry[] = [];

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
                    // TODO: Handle error with logs
                    throw err;
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
