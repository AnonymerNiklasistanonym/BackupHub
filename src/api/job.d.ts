import type { Instruction } from "./instruction";
import type { Log } from "./log";

export namespace Job {

    export interface Output {
        log: Log.Entry[]
    }

    export interface DefaultData {
        backupDirs: string[]
        sourceDir: string
    }

}

export interface Job<JOB_DATA extends Job.DefaultData = Job.DefaultData> {
    name: string
    description?: string
    data: JOB_DATA
    instructions: Instruction<any, any>[]
}
