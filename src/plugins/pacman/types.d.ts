import type { Instruction as ApiInstruction } from "../../api/instruction";
import type { PacmanCommand } from "../pacman";


export namespace Pacman {
    export interface Options {
        jsonOutputFilePaths: string[]
    }

    export type PluginName = "Pacman";

    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    export interface Instruction extends ApiInstruction<PacmanCommand, Options, PluginName> {}

}
