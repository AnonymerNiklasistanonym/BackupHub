import type { Instruction as ApiInstruction } from "../../api/instruction";
import type { GitCommand } from "../git";


export namespace Git {

    export interface Repo {
        name: string
        baseUrl: string
    }

    export interface Options {
        /**
         * Directory backup locations
         */
        backupDirs: string[]
        /**
         * Git repository list
         */
        gitRepoList: Repo[]
    }

    export type PluginName = "Git";

    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    export interface Instruction extends ApiInstruction<GitCommand, Options, PluginName> { }

}
