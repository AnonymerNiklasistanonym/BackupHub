import type { Instruction as ApiInstruction } from "../../api/instruction";
import type { GriveCommands } from "./grive";


export namespace Grive {
    export interface Options {
        /**
         * The source Google Drive directory
         */
        googleDriveDir: string
        /**
         * Option: "-V"/"--verbose" Verbose mode. Enable more messages than normal.
         */
        verbose?: boolean
        /**
         * Option: "-P"/"--progress-bar" Enable progress bar for upload/download of files
         */
        progressBar?: boolean
    }

    export type PluginName = "Grive";

    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    export interface Instruction extends ApiInstruction<GriveCommands, Options, PluginName> {}

}
