import commandExists from "command-exists";

/**
 * Check if a given command can be found
 *
 * TODO Enable version checking
 *
 * @param command The command to be found
 * @returns True if command can be found
 */
export const commandCanBeFound = async (command: string): Promise<boolean> => new Promise((resolve, reject) => {
    commandExists(command, (err, exists) => {
        if (err) {
            return reject(err);
        }
        return resolve(exists);
    });
});
