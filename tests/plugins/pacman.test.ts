/* eslint-disable no-duplicate-imports */
import chai from "chai";
import { describe } from "mocha";
import type { PacmanPackageEntry } from "../../src/plugins/pacman";
import { parsePacmanPackageEntry } from "../../src/plugins/pacman";


export default (): Mocha.Suite => {
    return describe("parsePacmanPackageEntry [pacman]", () => {
        it("parsePacmanPackageEntry", () => {

            const pacmanPackageEntryString = [
                "Name            : accountsservice",
                "Version         : 0.6.55-2",
                "Description     : D-Bus interface for user account query and manipulation",
                "Architecture    : x86_64",
                "URL             : https://gitlab.freedesktop.org/accountsservice/accountsservice",
                "Licenses        : GPL3",
                "Groups          : None",
                "Provides        : libaccountsservice.so=0-64",
                "Depends On      : glib2  polkit  systemd  shadow",
                "Optional Deps   : None",
                "Required By     : mugshot",
                "Optional For    : lightdm",
                "Conflicts With  : None",
                "Replaces        : None",
                "Installed Size  : 1034,80 KiB",
                "Packager        : Jan Alexander Steffens (heftig) <jan.steffens@gmail.com>",
                "Build Date      : Fr 01 Mai 2020 21:39:41 CEST",
                "Install Date    : Fr 08 Mai 2020 21:27:58 CEST",
                "Install Reason  : Explicitly installed",
                "Install Script  : No",
                "Validated By    : Signature"
            ].join("\n");

            chai.expect(parsePacmanPackageEntry(pacmanPackageEntryString)).to.be.deep.equals([
                {
                    architecture: "x86_64",
                    buildDate: "Fr 01 Mai 2020 21:39:41 CEST",
                    conflictsWith: "None",
                    dependsOn: [
                        "glib2",
                        "polkit",
                        "systemd",
                        "shadow"
                    ],
                    description: "D-Bus interface for user account query and manipulation",
                    groups: [
                        "None"
                    ],
                    installDate: "Fr 08 Mai 2020 21:27:58 CEST",
                    installReason: "Explicitly installed",
                    installScript: "No",
                    installedSize: "1034,80 KiB",
                    licenses: [
                        "GPL3"
                    ],
                    name: "accountsservice",
                    optionalDeps: [
                        "None"
                    ],
                    optionalFor: [
                        "lightdm"
                    ],
                    packager: "Jan Alexander Steffens (heftig) <jan.steffens@gmail.com>",
                    provides: [
                        "libaccountsservice.so=0-64"
                    ],
                    replaces: "None",
                    requiredBy: [
                        "mugshot"
                    ],
                    url: "https://gitlab.freedesktop.org/accountsservice/accountsservice",
                    validatedBy: [
                        "Signature"
                    ],
                    version: "0.6.55-2"
                }
            ] as PacmanPackageEntry[],
            "Correct parsing of pacman output"
            );

            const pacmanPackageEntryString2 = [
                "Name            : anki",
                "Version         : 2.1.26-1",
                "Description     : Helps you remember facts (like words/phrases in a foreign language) efficiently",
                "Architecture    : x86_64",
                "URL             : https://ankisrs.net/",
                "Licenses        : AGPL3",
                "Groups          : None",
                "Provides        : None",
                // eslint-disable-next-line max-len
                "Depends On      : python-beautifulsoup4  python-requests  python-wheel  python-decorator  python-distro  python-protobuf ", "python-jsonschema  python-markdown  python-pyaudio  python-pyqt5  python-pyqtwebengine  python-send2trash",
                "Optional Deps   : lame: record sound [installed]",
                "                  mpv: play sound. prefered over mplayer [installed]",
                "                  mplayer: play sound [installed]",
                "Required By     : None",
                "Optional For    : None",
                "Conflicts With  : None",
                "Replaces        : None",
                "Installed Size  : 33,93 MiB",
                "Packager        : Johannes Löthberg <johannes@kyriasis.com>",
                "Build Date      : Sa 09 Mai 2020 19:07:27 CEST",
                "Install Date    : Mo 18 Mai 2020 23:31:31 CEST",
                "Install Reason  : Explicitly installed",
                "Install Script  : No",
                "Validated By    : Signature"
            ].join("\n");

            chai.expect(parsePacmanPackageEntry(pacmanPackageEntryString2)).to.be.deep.equals([
                {
                    architecture: "x86_64",
                    buildDate: "Sa 09 Mai 2020 19:07:27 CEST",
                    conflictsWith: "None",
                    dependsOn: [
                        "python-beautifulsoup4",
                        "python-requests",
                        "python-wheel",
                        "python-decorator",
                        "python-distro",
                        "python-protobuf",
                        "python-jsonschema",
                        "python-markdown",
                        "python-pyaudio",
                        "python-pyqt5",
                        "python-pyqtwebengine",
                        "python-send2trash"
                    ],
                    description: "Helps you remember facts (like words/phrases in a foreign language) efficiently",
                    groups: [
                        "None"
                    ],
                    installDate: "Mo 18 Mai 2020 23:31:31 CEST",
                    installReason: "Explicitly installed",
                    installScript: "No",
                    installedSize: "33,93 MiB",
                    licenses: [
                        "AGPL3"
                    ],
                    name: "anki",
                    optionalDeps: [
                        "lame: record sound [installed]",
                        "mpv: play sound. prefered over mplayer [installed]",
                        "mplayer: play sound [installed]"
                    ],
                    optionalFor: [
                        "None"
                    ],
                    packager: "Johannes Löthberg <johannes@kyriasis.com>",
                    provides: [
                        "None"
                    ],
                    replaces: "None",
                    requiredBy: [
                        "None"
                    ],
                    url: "https://ankisrs.net/",
                    validatedBy: [
                        "Signature"
                    ],
                    version: "2.1.26-1"
                }
            ] as PacmanPackageEntry[],
            "Correct parsing of pacman output"
            );
        });
    });
};
