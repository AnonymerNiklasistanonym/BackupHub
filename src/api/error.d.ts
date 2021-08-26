import { Log } from "./log";

/**
 * Error that should be thrown internally in backup hub
 */
export interface GenericBackupHubError extends Error {
    logs?: Log.Entry[]
}

/**
 * Error that is thrown by backup hub
 */
export interface BackupHubError extends GenericBackupHubError {
    backupHubVersion: string
}

/**
 * Error that is thrown by the plugin
 */
export interface PluginError extends GenericBackupHubError {
    pluginName: string
    pluginVersion: string
}
