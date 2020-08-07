import { promises as fs } from "fs";

interface FsStatError extends Error {
    code: string
}

/* eslint-disable @typescript-eslint/require-await */
export const fileExists = async (filePath: string): Promise<boolean> => {
    try {
        const stat = await fs.stat(filePath);
        return stat.isFile();
    } catch (err) {
        if ((err as FsStatError).code === "ENOENT") {
            return false;
        }
        throw err;
    }
};

export const directoryExists = async (directoryPath: string): Promise<boolean> => {
    try {
        const stat = await fs.stat(directoryPath);
        return stat.isDirectory();
    } catch (err) {
        if ((err as FsStatError).code === "ENOENT") {
            return false;
        }
        throw err;
    }
};
