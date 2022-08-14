// Package imports
import path from "path";
// Local imports
import { fileNameConfig } from "./fileNames";

/**
 * Command line interface variable handling.
 */

/**
 * Generic information about a CLI option.
 */
export interface CliOptionInformation {
    /** The name of the option. */
    name: string
    /** The signature of the option. */
    signature?: string
    /** The description of the option. */
    description: string
    /** The default value. */
    default?: string
    /** Usage example. */
    example?: string
}

/**
 * CLI options.
 */
export enum CliOption {
    CONFIG_FILE = "--config",
    HELP = "--help",
    VERSION = "--version",
}

/**
 * Command line interface variable information.
 */
export const cliOptionInformation: CliOptionInformation[] = [
    {
        default: path.join(process.cwd(), fileNameConfig),
        description:
      "A custom config file path",
        name: CliOption.CONFIG_FILE,
        signature: "CONFIG_FILE"
    },
    {
        description: "Get instructions on how to run and configure this program",
        name: CliOption.HELP
    },
    {
        description: "Get the version of the program",
        name: CliOption.VERSION
    }
];
