import { describe, Suite } from "mocha";
import { logFormatterTestSuite } from "./helper/logFormatter.test";
import { variableResolutionTestSuite } from "./helper/variableResolution.test";

export const helperTestSuite = (): Suite =>
    describe("helper", () => {
        logFormatterTestSuite();
        variableResolutionTestSuite();
    });
