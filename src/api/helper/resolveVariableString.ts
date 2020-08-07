import type { Config } from "../config";

// eslint-disable-next-line complexity
export const resolveVariableString = (
    variables: Config.Globals.Variable[], content: string | string[], depth = 0
): string | string[] => {
    let output: string | string[] = content;
    let noChange = true;

    // Detect and stop circular dependencies
    if (depth >= 999) {
        throw Error("Variable resolving was stopped because there is probably a circular dependency (depth)");
    } else {
        if (Array.isArray(output)) {
            if (output.find(a => a.length >= Math.pow(10, 4))) {
                throw Error("Variable resolving was stopped because there is probably a circular dependency (length)");
            }
            if (output.length >= Math.pow(10, 3)) {
                throw Error("Variable resolving was stopped because there is probably a circular dependency (count)");
            }
        } else if (output.length >= Math.pow(10, 4)) {
            throw Error("Variable resolving was stopped because there is probably a circular dependency (length)");
        }
    }

    for (const variable of variables) {

        const resolvesMultipleTimes = Array.isArray(variable.value);
        let preString = "";
        if (resolvesMultipleTimes) {
            preString = "\\.\\.\\.";
        }
        const variableRegex = new RegExp(`\\$\\{${preString}${variable.name}\\}`, "g");

        if (resolvesMultipleTimes) {
            // The variable resolver will result in n times 'variable value count' outputs
            if (Array.isArray(output)) {
                // If there are already multiple outputs run the regex on every one of them
                const tempOutput = output.slice();
                output = [];
                for (const singleOutput of tempOutput) {
                    let somethingChanged = false;
                    let elementsAdded = 0;
                    for (const variableValue of variable.value as string[]) {
                        const temp = singleOutput.replace(variableRegex, () => {
                            noChange = false;
                            somethingChanged = true;
                            return variableValue;
                        });
                        if (somethingChanged) {
                            // Only add new element if there was a change to the old one
                            output.push(temp);
                            elementsAdded++;
                            somethingChanged = false;
                        }
                    }
                    if (elementsAdded === 0) {
                        // If no element was added readd the old element
                        output.push(singleOutput);
                    }
                }
            } else {
                // Convert output to array
                const tempOutputSingle = output;
                output = [];
                let somethingChanged = false;
                let elementsAdded = 0;
                for (const variableValue of variable.value as string[]) {
                    const temp = tempOutputSingle.replace(variableRegex, () => {
                        noChange = false;
                        somethingChanged = true;
                        return variableValue;
                    });
                    if (somethingChanged) {
                        // Only add new element if there was a change to the old one
                        output.push(temp);
                        elementsAdded++;
                        somethingChanged = false;
                    }
                }
                if (elementsAdded === 0) {
                    // If no element was added readd the old element
                    output.push(tempOutputSingle);
                }
            }
        } else {
            // The variable resolver will result in n times 1 outputs
            if (Array.isArray(output)) {
                // If there are already multiple outputs run the regex on every one of them
                for (let index = 0; index < output.length; index++) {
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                    output[index] = output[index].replace(variableRegex, () => {
                        noChange = false;
                        return variable.value as string;
                    });
                }
            } else {
                output = output.replace(variableRegex, () => {
                    noChange = false;
                    return variable.value as string;
                });
            }
        }
    }
    if (Array.isArray(output) && output.length === 1) {
        output = output[0];
    }
    return noChange ? output : resolveVariableString(variables, output, depth + 1);
};
