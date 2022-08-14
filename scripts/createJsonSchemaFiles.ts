// Package imports
import * as tsj from "ts-json-schema-generator";
import { promises as fs } from "fs";
import path from "path";

const rootPath = path.join(__dirname, "..");

interface Config {
    type: string
    outputPath: string
    inputPath: string
    tsConfigPath: string
}

const configs = [
    {
        inputPath: path.join(rootPath, "src", "config_type.ts"),
        outputPath: path.join(rootPath, "config.schema.json"),
        tsConfigPath: path.join(rootPath, "tsconfig.json"),
        type: "ConfigFile"
    }
];

const JSON_SPACING = 4;

/**
 * Write a JSON file.
 *
 * @param filePath Path of file/directory.
 * @param data The new data of the JSON file.
 * @template INPUT The type of the JSON file to validate the data.
 */
export const writeJsonFile = async <INPUT>(filePath: string, data: INPUT) =>
    await fs.writeFile(filePath, JSON.stringify(data, undefined, JSON_SPACING));

const createJsonSchemaFile = (config: Config) => {
    // eslint-disable-next-line no-console
    console.log(
        `Create JSON schema file '${config.outputPath}' of type '${config.type}'...`
    );

    const schema = tsj
        .createGenerator({
            path: config.inputPath,
            tsconfig: config.tsConfigPath,
            type: config.type
        })
        .createSchema(config.type);

    writeJsonFile(config.outputPath, schema).catch(console.error);
};

configs.forEach(createJsonSchemaFile);
