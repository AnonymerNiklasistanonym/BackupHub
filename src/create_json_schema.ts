import * as path from "path";
import * as TJS from "typescript-json-schema";
import { promises as fs } from "fs";

(async (): Promise<void> => {

    // optionally pass argument to schema generator
    const settings: TJS.PartialArgs = {
        required: true
    };

    // optionally pass ts compiler options
    const compilerOptions: TJS.CompilerOptions = {
        esModuleInterop: true,
        strictNullChecks: true
    };

    // optionally pass a base path
    const configFilePath = path.join(__dirname, "config_type.ts");
    const program = TJS.getProgramFromFiles(
        [configFilePath],
        compilerOptions
    );

    // We can either get the schema for one file and one type...
    const schema = TJS.generateSchema(program, "ConfigFile", settings);

    console.info(schema);

    await fs.writeFile(path.join(__dirname, "..", "config.schema.json"), JSON.stringify(schema, null, 4));

})().catch(err => {
    console.error(err);
    process.exit(1);
});
