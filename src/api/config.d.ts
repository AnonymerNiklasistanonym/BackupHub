export namespace Config {

    export namespace Globals {

        export interface Variable {
            /**
             * Global variable name
             */
            name: string
            /**
             * Global variable description
             */
            description?: string
            /**
             * Global variable value(s)
             */
            value: string | string[]
        }

        export interface Method<FUNCTION_PARAMETER extends any[], FUNCTION_OUTPUT> {
            name: string
            description: string
            function: (parameter: FUNCTION_PARAMETER) => Promise<FUNCTION_OUTPUT>
        }

    }

    export interface Globals {
        variables: Globals.Variable[]
        methods: Globals.Method<any[], any>[]
    }
}
