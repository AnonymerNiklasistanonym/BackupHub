import type { Instruction as ApiInstruction } from "../../api/instruction";
import type { GitLabCommand } from "../gitlab";


export namespace GitLab {

    export interface Options {
        /**
         * Directory backup locations
         */
        backupDirs: string[]
        /**
         * GitLab API information to backup all repositories the account has access to
         */
        gitlabApiOauthToken: string
        /**
         * GitLab API host (instance) URL
         */
        gitlabApiHostUrl: string
        /**
         * GitLab account name
         */
        gitlabApiAccountName: string
    }

    export type PluginName = "GitLab";

    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    export interface Instruction extends ApiInstruction<GitLabCommand, Options, PluginName> { }

}
