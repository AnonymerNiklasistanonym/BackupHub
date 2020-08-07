import apiVariableResolution from "./api/variableResolution.test";
import pacman from "./plugins/pacman.test";


describe("api", () => {
    apiVariableResolution();
});

describe("plugins", () => {
    pacman();
});
