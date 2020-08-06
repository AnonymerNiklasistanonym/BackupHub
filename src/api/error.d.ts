import { Log } from "./log";

/**
 * Error that is thrown by the plugin
 */
export interface PluginError extends Error {
    logs?: Log.Entry[]
}
