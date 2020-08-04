import { promises as fs } from "fs";
import path from "path";

(async (): Promise<void> => {
    const distDir = path.join(__dirname, "..", "dist");
    try {
        console.info(`> Remove dist directory (${distDir})...`);
        await fs.rmdir(distDir, { recursive: true });
    } catch (err) {
        console.info(`  -> Not successful: ${(err as Error).message}`);
        throw err;
    }

    const coverageDir = path.join(__dirname, "..", ".nyc_output");
    try {
        console.info(`> Remove temporary coverage directory (${coverageDir})...`);
        await fs.rmdir(coverageDir, { recursive: true });
    } catch (err) {
        console.info(`  -> Not successful: ${(err as Error).message}`);
        throw err;
    }
})().catch(err => {
    console.error(err);
    process.exit(1);
});
