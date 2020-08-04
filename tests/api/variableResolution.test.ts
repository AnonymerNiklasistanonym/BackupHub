import chai from "chai";
import { describe } from "mocha";
import { resolveVariableString } from "../../src/api/helper/variableResolution";


export default (): Mocha.Suite => {
    return describe("variableResolution [api]", () => {
        it("resolveVariableString", () => {

            chai.expect(resolveVariableString([
                { name: "Test", value: "TestValue" },
                { name: "Test1", value: "TestValue1" }
            ], "${Test}Testtest${Test1}${Test}cdefg${Test1}")).to.be.equals(
                "TestValueTesttestTestValue1TestValuecdefgTestValue1"
            );

            chai.expect(resolveVariableString([
                { name: "SOURCE_DIR", value: "~" }
            ], "${SOURCE_DIR}")).to.be.equals(
                "~"
            );

            chai.expect(resolveVariableString([
                {
                    description: "The external backup drives",
                    name: "BACKUP_DRIVE",
                    value: [ "/run/media/$USER/Backup 4TB", "/run/media/$USER/Backup #1" ]
                },
                {
                    name: "BACKUP_DIR",
                    value: "${...BACKUP_DRIVE}/BackupManjaroDesktop/"
                }
            ], "${BACKUP_DIR}")).to.be.deep.equals(
                [
                    "/run/media/$USER/Backup 4TB/BackupManjaroDesktop/",
                    "/run/media/$USER/Backup #1/BackupManjaroDesktop/"
                ]
            );

            chai.expect(resolveVariableString([
                { name: "Test", value: "TestValue" },
                { name: "Test1", value: "TestValue1" },
                { name: "DEVICES", value: [ "/abc", "/def" ] }
            ], "${...DEVICES}/Testtest${Test1}${Test}")).to.be.deep.equals(
                [
                    "/abc/TesttestTestValue1TestValue",
                    "/def/TesttestTestValue1TestValue"
                ]
            );
        });
    });
};
