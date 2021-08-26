import { describe, Suite } from "mocha";
import chai from "chai";
import { logFormatter } from "../../../src/api/helper";


export const logFormatterTestSuite = (): Suite =>
    describe("logFormatter", () => {
        it("empty logs", () => {
            chai.expect(logFormatter([])).to.be.equals(
                "",
                "empty"
            );
        });

        it("check format", () => {
            chai.expect(logFormatter([
                { content: "a", creator: "bb", time: new Date(Date.UTC(1995, 11, 17)) }
            ])).to.be.equals(
                "1995-12-17T00:00:00.000Z [INFO] bb: a",
                "single entry"
            );

            chai.expect(logFormatter([
                { content: "a", creator: "bb", time: new Date(Date.UTC(1995, 11, 17)) },
                { content: "b", creator: "cc", time: new Date(Date.UTC(1995, 11, 18)) }
            ])).to.be.equals(
                "1995-12-17T00:00:00.000Z [INFO] bb: a\n" +
                "1995-12-18T00:00:00.000Z [INFO] cc: b",
                "multiple entries"
            );
        });
    });
