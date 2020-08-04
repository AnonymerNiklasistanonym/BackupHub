import type { LogLevel } from "./logLevel";

export namespace Log {

    export interface Entry {
        /**
         * To which log level does this entry belong to
         */
        level?: LogLevel
        /**
         * What is logged
         */
        content: string
        /**
         * Who is the creator of the entry (the plugin name, the system section, ...)
         */
        creator: string
        /**
         * The time when the log entry is created
         */
        time: Date
    }

}
