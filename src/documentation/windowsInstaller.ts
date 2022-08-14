// Package imports
import { promises as fs } from "fs";
// Local imports
import { name, sourceCodeUrl } from "../info/general";
import { getVersionFromObject } from "../info/version";
import { version } from "../info/version";

export const createWindowsInstallerConfigFile = async (outputPath: string): Promise<void> => {
    let outputString = "";
    outputString += ";Define name and lowercase name of the product\n";
    outputString += `!define PRODUCT "${name}"\n`;
    outputString += `!define PRODUCT_LOWERCASE "${name.toLowerCase()}"\n`;
    outputString += ";Define version of the product\n";
    outputString += `!define PRODUCT_VERSION "${getVersionFromObject(
        version
    ).slice(1)}"\n`;
    outputString += ";Define URL of the product\n";
    outputString += `!define PRODUCT_URL "${sourceCodeUrl}"\n`;

    await fs.writeFile(outputPath, outputString);
};
