import { Application, TSConfigReader, TypeDocReader } from "typedoc";
import { createTypedocReadme } from "./createTypedocReadme";
import glob from "glob";
import path from "path";


/** The default directory where the documentation is generated */
export const defaultDocsOutputDir = path.join(__dirname, "..", "dist", "docs");

// First create typedoc README
(async (): Promise<void> => {
    try {
        await createTypedocReadme();

        const app = new Application();

        // If you want TypeDoc to load tsconfig.json / typedoc.json files
        app.options.addReader(new TSConfigReader());
        app.options.addReader(new TypeDocReader());

        const entryPoints = await new Promise<string[]>((resolve, reject) => {
            glob(path.join(__dirname, "..", "src/{api,api/helper,plugins}/**/*.ts"), (err, files) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(files);
                }
            });
        });

        app.bootstrap({
            categorizeByGroup: true,
            entryPoints,
            exclude: [
                path.join(__dirname, "..", "node_modules/**/*"),
                path.join(__dirname, "..", "docs/**/*"),
                path.join(__dirname, "..", "dist/**/*"),
                path.join(__dirname, "..", "tests/**/*")
            ],
            name: "Backup Hub Modules",
            readme: path.join(defaultDocsOutputDir, "README.md"),
            version: true
        });

        const project = app.convert();

        if (project) {
            await app.generateDocs(project, path.join(defaultDocsOutputDir, "site"));
        } else {
            throw Error("TypeDoc documentation generation was not successful");
        }
    } catch (error) {
        throw error;
    }
})().catch(error => {
    console.error(error);
    process.exit(1);
});
