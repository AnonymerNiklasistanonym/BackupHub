import commandExists from "command-exists";

export const commandCanBeFound = async (command: string): Promise<boolean> => new Promise((resolve, reject) => {
    commandExists(command, (err, exists) => {
        if (err) {
            return reject(err);
        }
        return resolve(exists);
    });
});
