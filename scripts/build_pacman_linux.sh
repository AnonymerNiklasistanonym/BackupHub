#!/usr/bin/env bash

set -e

echo "---------------------------------------------------------"
echo "Build Pacman [Linux]:  <Bash>"
echo "---------------------------------------------------------"

# Display pacman/makepkg version
echo "pacman:"
pacman --version
echo "makepkg:"
makepkg --version

# Get the current directory
CALL_DIR="$PWD"
# Go to the location of this directory even if the script is being run from
# somewhere else
SCRIPT_DIR="$( cd -- "$( dirname -- "${BASH_SOURCE[0]:-$0}"; )" &> /dev/null && pwd 2> /dev/null; )";
cd "$SCRIPT_DIR"
# Go to the root directory of this repository
cd ..

# Go to installer directory and create the normal, git and binary package
cd installer
makepkg -p PKGBUILD     --log --clean -f --syncdeps --rmdeps
makepkg -p PKGBUILD     --printsrcinfo > .SRCINFO
makepkg -p PKGBUILD_GIT --log --clean -f --syncdeps --rmdeps
makepkg -p PKGBUILD_GIT --printsrcinfo > .SRCINFO_GIT
makepkg -p PKGBUILD_BIN --log --clean -f --syncdeps --rmdeps
makepkg -p PKGBUILD_BIN --printsrcinfo > .SRCINFO_BIN

# Go back to the call directory
cd "$CALL_DIR"
