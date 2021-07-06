import { promises as fs } from "fs";
import path from "path";


/** The default directory where the documentation is generated */
export const defaultDocsOutputDir = path.join(__dirname, "..", "dist", "docs");

export const createTypedocReadme = async (): Promise<void> => {

    // Create build directory if not existing
    await fs.mkdir(defaultDocsOutputDir, { recursive: true });

    // Copy top level README into it
    const finalReadmePath = path.join(defaultDocsOutputDir, "README.md");
    await fs.copyFile(path.join(__dirname, "typedocReadme.md"), finalReadmePath);

    // Append extra data to typedoc README
    const dataReadme = await fs.readFile(path.join(__dirname, "..", "README.md"), { encoding: "utf-8" });
    await fs.appendFile(finalReadmePath,
        "\n" + dataReadme.replace(/^#/g, "##")
            .replace("(src/index.ts)",
                "(https://github.com/AnonymerNiklasistanonym/BackupHub/blob/main/src/index.ts)"));
    const dataTodo = await fs.readFile(path.join(defaultDocsOutputDir, "todos.md"), { encoding: "utf-8" });
    await fs.appendFile(finalReadmePath, "\n" + dataTodo.replace(/^#/g, "##"));
};
