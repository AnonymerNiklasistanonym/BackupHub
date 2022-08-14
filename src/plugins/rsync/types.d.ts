import type { Instruction as ApiInstruction } from "../../api/instruction";
import type { Job } from "../../api/job";
import type { RsyncCommand } from "../rsync";

export namespace Rsync {
    export interface Options extends Job.DefaultData {
        /**
         * Directory that should be synced
         */
        sourceDir: string
        /**
         * Option: "-v"/"--verbose"    to get a visual progress bar
         */
        verbose?: boolean
        /**
         * Option: "-r"/"--recursive"  to recurse into directories
         */
        recursive?: boolean
        /**
         * Option: "-a"/"--archive"    to preserve the date, ownership, permissions, groups
         */
        archive?: boolean
        /**
         * Option: "--delete"          to delete deleted files in destination directory
         */
        delete?: boolean
        /**
         * Option: "--delete-excluded" to also delete excluded files in destination directory
         */
        deleteExcluded?: boolean
        /**
         * Option: "--exclude-from 'rsync_exclude_list.txt'" to ignore certain files from getting a backup
         */
        excludeFrom?: string[]
    }

    export type PluginName = "Rsync";

    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    export interface Instruction extends ApiInstruction<RsyncCommand, Options, PluginName> {}

}
