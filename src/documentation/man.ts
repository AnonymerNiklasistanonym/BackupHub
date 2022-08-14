// Package imports
import { promises as fs } from "fs";
// Local imports
import {
    author,
    binaryName,
    bugTrackerUrl,
    description,
    license,
    licenseUrl,
    longDescription,
    name,
    sourceCodeUrl,
    usages,
    websiteUrl
} from "../info/general";
import { getVersionFromObject, version } from "../info/version";
import { cliOptionInformation } from "../info/cli";

export const createManPageFile = async (outputPath: string) => {
    let outputString = "";
    // Header
    outputString += `% ${name}(1) ${binaryName} ${getVersionFromObject(
        version
    ).slice(1)}\n`;
    outputString += `% ${author}\n`;
    const currentDate = new Date();
    const monthNames = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December"
    ];
    const monthString = monthNames[currentDate.getMonth()];
    outputString += `% ${monthString} ${currentDate.getFullYear()}\n`;
    outputString += "\n";
    // Name
    outputString += "# NAME\n\n";
    outputString += `${binaryName} - ${description}.\n`;
    outputString += "\n";
    // SYNOPSIS
    outputString += "# SYNOPSIS\n\n";
    for (const usage of usages) {
        outputString += `**${binaryName}** ${usage.signature.replace(
            /OPTIONS/g,
            "*OPTIONS*"
        )}\n`;
    }
    outputString += "\n";
    // DESCRIPTION
    outputString += "# DESCRIPTION\n\n";
    outputString += `${longDescription}\n\n`;
    // OPTIONS
    outputString += "# OPTIONS\n\n";
    for (const cliOption of cliOptionInformation) {
        outputString += `${cliOption.name}`;
        if (cliOption.signature) {
            outputString += ` ${cliOption.signature
                .split(" ")
                .map((a) => "*" + a + "*")
                .join(" ")}`;
        }
        outputString += `\n: ${cliOption.description}\n\n`;
    }
    // BUGS
    outputString += "# BUGS\n\n";
    outputString += `Bugs are tracked in GitHub Issues: ${bugTrackerUrl}\n`;
    outputString += "\n";
    // COPYRIGHT
    outputString += "# COPYRIGHT\n\n";
    outputString += `${name} is available under the ${license} license.\n\n`;
    outputString += `See ${licenseUrl} for the full license text.\n`;
    outputString += "\n";
    // SEE ALSO
    outputString += "# SEE ALSO\n\n";
    outputString += `Website and Documentation: ${websiteUrl}\n\n`;
    outputString += `GitHub repository and issue tracker: ${sourceCodeUrl}\n`;

    // Update highlighting some values and CLI options
    for (const cliOption of cliOptionInformation) {
        outputString = outputString.replace(
            new RegExp(`${cliOption.name}`, "g"),
            `**${cliOption.name}**`
        );
    }
    // Fix bad paths and path formatting
    outputString = outputString
        .replace(/\.env/g, "*.env*")
        .replace(/customCommands\.json/g, "*customCommands.json*")
        .replace(/customTimers\.json/g, "*customTimers.json*")
        .replace(
            /\$HOME\/\.local\/share\/moonpiebot/g,
            "*$HOME/.local/share/moonpiebot*"
        );
    // Fix options not being displayed correctly
    outputString = outputString.replace(/--/g, "----");

    await fs.writeFile(outputPath, outputString);
};
