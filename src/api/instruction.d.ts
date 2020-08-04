import type { Log } from "./log";
import type { PluginList } from "./pluginList";

export namespace Job {

    export interface Output {
        log: Log.Entry[]
    }

}

export interface Instruction<COMMANDS, COMMAND_OPTIONS, PLUGIN_LIST extends PluginList = PluginList> {
    plugin: PLUGIN_LIST
    command: COMMANDS
    options: COMMAND_OPTIONS
}

export interface Job<JOB_DATA> {
    name: string
    description: string
    data: JOB_DATA
    instructions: Instruction<any, any, any>[]
}
