import type { OfficiallySupportedPluginList } from "./pluginList";


export interface Instruction<COMMANDS, COMMAND_OPTIONS, PLUGIN_NAME = OfficiallySupportedPluginList | string> {
    /**
     * Plugin name
     */
    plugin: PLUGIN_NAME
    /**
     * Plugin command
     */
    command: COMMANDS
    /**
     * Plugin command options
     */
    options: COMMAND_OPTIONS
}
