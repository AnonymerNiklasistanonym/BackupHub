import type { AbruneggOneDriveCommands } from "./abruneggOneDrive";
import type { Instruction as ApiInstruction } from "../../api/instruction";


export namespace AbruneggOneDrive {
    export interface Options {
        /**
         * Option: "-v"/"--verbose" Print more details, useful for debugging
         */
        verbose?: boolean
        /**
         * Option: "-d"/"--download" Only download remote changes
         */
        download?: boolean
    }

    export type PluginName = "AbruneggOneDrive";

    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    export interface Instruction extends ApiInstruction<AbruneggOneDriveCommands, Options, PluginName> {}

}
