import type { Config } from "./config";
import type { Instruction } from "./instruction";
import type { Job } from "./job";
import type { Log } from "./log";


export namespace Plugin {

    export interface Output {
        log: Log.Entry[]
    }

    export namespace Info {

        export interface Version {
            major: number
            minor?: number
            patch?: number
        }

        interface RoutineOption {
            globals: Config.Globals
        }

        interface RoutineOptionJob<JOB_DATA extends Job.DefaultData = Job.DefaultData> extends RoutineOption {
            job: JOB_DATA
        }

        // Disable eslint message since it is being used
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        interface Routines<JOB_DATA extends Job.DefaultData = Job.DefaultData> {
            /**
             * Is run when adding the plugin to verify it works
             */
            test?: (options: RoutineOption) => Promise<Output> | Output
            /**
             * Is run when adding the plugin
             */
            setup?: (options: RoutineOption) => Promise<Output> | Output
            /**
             * Is run before the instruction
             */
            beforeInstruction?: (options: RoutineOptionJob<JOB_DATA>) => Promise<Output> | Output
            /**
             * Runs the instruction
             */
            runInstruction: (
                options: RoutineOptionJob<JOB_DATA>, instruction: Instruction<any, any>
            ) => Promise<Output> | Output
            /**
             * Is run after the instruction
             */
            afterInstruction?: (options: RoutineOptionJob<JOB_DATA>) => Promise<Output> | Output
        }

    }

}

interface Plugin<JOB_DATA extends Job.DefaultData = Job.DefaultData> {
    name: string
    versionNumbers: Plugin.Info.Version
    version: string
    description?: string
    url?: string
    routines: Plugin.Info.Routines<JOB_DATA>
}
