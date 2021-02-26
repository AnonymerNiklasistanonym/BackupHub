import type { Config } from "./api/config";
import type { Job } from "./api/job";

export interface ConfigFileGlobals {
    /**
     * Global variables
     */
    variables: Config.Globals.Variable[]
}

export interface ConfigFile {
    /**
     * Global configurations
     */
    globals: ConfigFileGlobals
    /**
     * Backup jobs
     */
    jobs: Job[]
}
