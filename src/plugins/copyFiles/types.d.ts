import type { Instruction as ApiInstruction } from "../../api/instruction";
import type { CopyFilesCommand } from "../copyFiles";

export namespace CopyFiles {
    export interface Options {
        /**
         * Directory for relative paths
         */
        cwd?: string
        /**
         * Directories and files that should be synced to the backup directories
         */
        sourceFiles: string[]
        /**
         * Interpret source file path as glob command
         */
        glob?: boolean
        /**
         * Directory backup locations
         */
        backupDirs: string[]
        /**
         * Delete the previous backup
         */
        delete?: boolean
    }

    export type PluginName = "CopyFiles";

    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    export interface Instruction extends ApiInstruction<CopyFilesCommand, Options, PluginName> {}

}
