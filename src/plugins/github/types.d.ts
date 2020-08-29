import type { Instruction as ApiInstruction } from "../../api/instruction";
import type { GitHubCommand } from "../github";


export namespace GitHub {

    export interface Options {
        /**
         * Directory backup locations
         */
        backupDirs: string[]
        /**
         * GitHub API information to backup all repositories the account has access to
         */
        githubApiOauthToken: string
        /**
         * The GitHub account name
         */
        githubApiAccountName: string
    }

    export type PluginName = "GitHub";

    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    export interface Instruction extends ApiInstruction<GitHubCommand, Options, PluginName> { }

}
