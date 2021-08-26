import { describe, Suite } from "mocha";
import chai from "chai";
import { resolveVariableString } from "../../../src/api/helper";

export const variableResolutionTestSuite = (): Suite =>
    describe("variableResolution", () => {
        it("single value variables", () => {

            chai.expect(resolveVariableString([
                { name: "SOURCE_DIR", value: "~" }
            ], "${SOURCE_DIR}")).to.be.equals(
                "~",
                "One single value variable with one occurrence"
            );

            chai.expect(resolveVariableString([
                { name: "Test", value: "TestValue" }
            ], "${Test}A${Test}")).to.be.equals(
                "TestValueATestValue",
                "One single value variable with multiple occurrence"
            );

            chai.expect(resolveVariableString([
                { name: "Test", value: "TestValue" },
                { name: "Test1", value: "TestValue1" }
            ], "${Test}Testtest${Test1}${Test}cdefg${Test1}")).to.be.equals(
                "TestValueTesttestTestValue1TestValuecdefgTestValue1",
                "Multiple single value variables with multiple occurrences"
            );
        });

        it("multi value variables", () => {
            chai.expect(resolveVariableString([
                { name: "Test", value: ["TestValue"] },
                { name: "Test1", value: "TestValue1" }
            ], "${Test}Testtest${Test1}${Test}cdefg${Test1}")).to.be.equals(
                "${Test}TesttestTestValue1${Test}cdefgTestValue1",
                "Ignores multi value variable because single value is expected"
            );

            chai.expect(resolveVariableString([
                {
                    description: "The external backup drives",
                    name: "BACKUP_DRIVE",
                    value: [ "/run/media/${USER}/Backup 4TB", "/run/media/${USER}/Backup #1" ]
                },
                {
                    name: "BACKUP_DIR",
                    value: "${...BACKUP_DRIVE}/BackupManjaroDesktop/"
                },
                {
                    name: "USER",
                    value: "hans"
                }
            ], "${BACKUP_DIR}")).to.be.deep.equals(
                [
                    "/run/media/hans/Backup 4TB/BackupManjaroDesktop/",
                    "/run/media/hans/Backup #1/BackupManjaroDesktop/"
                ],
                "Mixed single and multiple value variables that resolve to each other"
            );
        });

        it("detect circular dependencies", () => {

            chai.expect(() => {
                resolveVariableString([
                    { name: "SOURCE_DIR", value: "~${SOURCE_DIR}" }
                ], "${SOURCE_DIR}");
            }).to.throw(
                "Variable resolving was stopped because there is probably a circular dependency (depth)",
                "Detect circular dependencies"
            );

            chai.expect(() => {
                resolveVariableString([
                    { name: "A", value: "~${A}${A}${A}${A}${A}${A}${A}${A}${A}${A}${A}${A}${A}${A}${A}${A}${A}" }
                ], "${A}");
            }).to.throw(
                "Variable resolving was stopped because there is probably a circular dependency (length)",
                "Detect circular dependencies"
            );

            chai.expect(() => {
                resolveVariableString([
                    { name: "B", value: "~${...A}${B}${B}${B}${B}${B}${B}${B}${B}${B}${B}${B}${B}${B}${B}" },
                    { name: "A", value: [ "~${B}", "~${B}${B}${B}" ] }
                ], "${...A}");
            }).to.throw(
                "Variable resolving was stopped because there is probably a circular dependency (length)",
                "Detect circular dependencies"
            );

            chai.expect(() => {
                resolveVariableString([
                    { name: "A", value: [ "~${...A}", "~${...A}${...A}", "~${...A}${...A}${...A}", "${...A}${...A}~" ] }
                ], "${...A}");
            }).to.throw(
                "Variable resolving was stopped because there is probably a circular dependency (count)",
                "Detect circular dependencies"
            );

        });
    });
