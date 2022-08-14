#!/usr/bin/env bash

set -e

# Install the following things first:
# - Node.js

echo "---------------------------------------------------------"
echo "Build Binary [Linux]:  <Bash>"
echo "---------------------------------------------------------"

# Display node/npm version
echo "node:"
node --version
echo "npm:"
npm --version

# Get the current directory
CALL_DIR="$PWD"
# Go to the location of this directory even if the script is being run from
# somewhere else
SCRIPT_DIR="$( cd -- "$( dirname -- "${BASH_SOURCE[0]:-$0}"; )" &> /dev/null && pwd 2> /dev/null; )";
cd "$SCRIPT_DIR"
# Go to the root directory of this repository
cd ..

# Install all dependencies and build the bot
rm -rf "node_modules"
npm install
npm run build
npm run package:linux

# Go back to the call directory
cd "$CALL_DIR"
