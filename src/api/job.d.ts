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
    /**
     * Job name
     */
    name: string
    /**
     * Job description
     */
    description?: string
    /**
     * Job data
     */
    data: JOB_DATA
    /**
     * Job instructions
     */
    instructions: Instruction<any, any>[]
}
