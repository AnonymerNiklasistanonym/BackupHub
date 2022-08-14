#!/usr/bin/env pwsh

$ErrorActionPreference = "Stop"

# Install the following things first:
# - Node.js

Write-Host "---------------------------------------------------------"
Write-Host "Build [Windows/Linux]:  <Powershell>"
Write-Host "---------------------------------------------------------"

# Display node/npm version
Write-Host "node:"
node --version
Write-Host "npm:"
npm --version

# Get the current directory
$CallDir = $pwd
# Go to the location of this directory even if the script is being run from
# somewhere else
Set-Location $PSScriptRoot
# Go to the root directory of this repository
Set-Location ..

# Install all dependencies and build the bot
Remove-Item "node_modules" -Recurse -ErrorAction Ignore
npm install
npm run build
npm prune --production

# Go back to the call directory
Set-Location $CallDir

# Wait for any input before closing the window
Write-Host "`n>> The script has finished. Press any key to close the window."
[Console]::ReadKey()
