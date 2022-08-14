#!/usr/bin/env pwsh

$ErrorActionPreference = "Stop"

# Install the following things first:
# - Node.js
# - NSIS

Write-Host "---------------------------------------------------------"
Write-Host "Build Binary [Windows]:  <Powershell>"
Write-Host "---------------------------------------------------------"

# Display node/npm/makensis version
Write-Host "node:"
node --version
Write-Host "npm:"
npm --version
Write-Host "makensis:"
$makensisWasFound = [bool] (Get-Command -ErrorAction Ignore -Type Application makensis)
if ($makensisWasFound) {
    makensis -VERSION
    Write-Host ""
} else {
    Write-Host "WARNING: makensis was not found, Windows installer will not be created"
}

# Get the current directory
$CallDir = $pwd
# Go to the location of this directory even if the script is being run from
# somewhere else
Set-Location $PSScriptRoot
# Go to the root directory of this repository
Set-Location ..

# Install all dependencies and build the bot
#Remove-Item "node_modules" -Recurse -ErrorAction Ignore
#npm install
#npm run build
#npm run package:windows

# Create the windows installer
if ($makensisWasFound) {
    Set-Location installer
    Set-Location windows_installer
    makensis windows_installer.nsi
    Set-Location ..
    Set-Location ..
}

# Go back to the call directory
Set-Location $CallDir

# Wait for any input before closing the window
Write-Host "`n>> The script has finished. Press any key to close the window."
[Console]::ReadKey()
