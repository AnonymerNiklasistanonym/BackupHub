import type { Instruction } from "./instruction";
import type { Log } from "./log";

export namespace Job {

    export interface Output {
        log: Log.Entry[]
    }

    export interface DefaultData {
        /**
         * The backup directories
         */
        backupDirs: string[]
        /**
         * The source directory
         */
        sourceDir: string
        /**
         * Run the job without actually performing any create/write/copy/... actions
         */
        dryRun?: boolean
    }

}

export interface Job<JOB_DATA extends Job.DefaultData = Job.DefaultData> {
    name: string
    description?: string
    data: JOB_DATA
    instructions: Instruction<any, any>[]
}
