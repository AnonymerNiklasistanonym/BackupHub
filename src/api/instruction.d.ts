import type { PluginList } from "./pluginList";


export interface Instruction<COMMANDS, COMMAND_OPTIONS, PLUGIN_LIST extends PluginList = PluginList> {
    /**
     * Plugin name
     */
    plugin: PLUGIN_LIST
    /**
     * Plugin command
     */
    command: COMMANDS
    /**
     * Plugin command options
     */
    options: COMMAND_OPTIONS
}
