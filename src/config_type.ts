import type { Config } from "./api/config";
import type { Job } from "./api/job";
import { GitHub } from "./plugins/github";
import { Rsync } from "./plugins/rsync";

export interface ConfigFileGlobals {
    /**
     * Global variables
     */
    variables: Config.Globals.Variable[]
}

export interface CustomJson {
    /**
     * Pointer to the schema against which this document should be
     * validated (Schema URL/path).
     */
    $schema?: string
}

export interface ConfigFile extends CustomJson {
    /**
     * Global configurations
     */
    globals: ConfigFileGlobals
    /**
     * Backup jobs
     */
    jobs: (Job|Job<Job.DefaultData>|Job<Job.DefaultDataSourceDir>)[]
}
