#!/usr/bin/env pwsh

$ErrorActionPreference = "Stop"

Write-Host "---------------------------------------------------------"
Write-Host "Clean [Windows/Linux]:  <Powershell>"
Write-Host "---------------------------------------------------------"

# Get the current directory
$CallDir = $pwd
# Go to the location of this directory even if the script is being run from
# somewhere else
Set-Location $PSScriptRoot
# Go to the root directory of this repository
Set-Location ..

# Remove temporary directories
$DistDir = "dist"
$BinaryDir = "bin"
$DocsDir = "docs"
$NodeModulesDir = "node_modules"
$InstallerDir = "installer"
$TmpDir = "tmp"

$DirectoriesToRemove = $DistDir,$BinaryDir,$DocsDir,$NodeModulesDir,$TmpDir
$FilesToRemoveFromInstallerDir = Get-ChildItem -Recurse -Include "*.log","*.zst","*.log","*.bin","*.svg","*.git","*.pkg","*.tar","logpipe.*","*.log.*" $InstallerDir

Remove-Item $DirectoriesToRemove -ErrorAction Ignore -Recurse -Force -Confirm:$false

foreach ($FileToRemoveFromInstallerDir in $FilesToRemoveFromInstallerDir)
{
    Remove-Item $FileToRemoveFromInstallerDir.FullName -ErrorAction Ignore -Force -Recurse -Confirm:$false
}

# Go back to the call directory
Set-Location $CallDir

# Wait for any input before closing the window
Write-Host "`n>> The script has finished. Press any key to close the window."
[Console]::ReadKey()
