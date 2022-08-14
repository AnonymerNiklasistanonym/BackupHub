/*
 * Version information
 */

/**
 * The Version structure.
 */
export interface Version {
    major: number
    minor: number
    patch: number
    /** Set true for beta builds/versions. */
    beta?: boolean
}

/**
 * Get a version string.
 *
 * @param version The version that should be used.
 * @returns "1.2.3b" or "1.2.3" if not in beta.
 */
export const getVersionFromObject = (version: Version): string =>
    `v${version.major}.${version.minor}.${version.patch}${
        version.beta ? "b" : ""
    }`;


/**
 * The version of the program.
 */
export const version: Version = {
    beta: true,
    major: 1,
    minor: 0,
    patch: 3
};
