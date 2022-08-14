#!/usr/bin/env pwsh

$ErrorActionPreference = "Stop"

Write-Host "---------------------------------------------------------"
Write-Host "Rename Downloaded Artifacts GitHub [Windows/Linux]:  <Powershell>"
Write-Host "---------------------------------------------------------"

# Get the current directory
$CallDir = $pwd
# Go to the location of this directory even if the script is being run from
# somewhere else
Set-Location $PSScriptRoot
# Go to the root directory of this repository
Set-Location ..

# Create directory for downloads
$BinaryDir = Join-Path "bin" "github_binaries"
New-Item -ItemType Directory -Force -Path $BinaryDir
# Downloaded file paths
$CurrentVersion = "1.0.17b"
$ApplicationName = "backuphub"
$ArtifactWindowsInstaller18 = Join-Path $BinaryDir "$ApplicationName-installer-windows-node-18.x.zip"
$ArtifactLinux18 = Join-Path $BinaryDir "$ApplicationName-linux-node-18.x.zip"
$ArtifactWindows18 = Join-Path $BinaryDir "$ApplicationName-windows-node-18.x.zip"
# Extract binary files from the downloaded artifacts
$ArtifactWindowsInstallerBinary = Join-Path $BinaryDir "${ApplicationName}_setup.exe"
$ArtifactWindowsInstaller18BinaryOut = "$ApplicationName-installer-v$CurrentVersion-win64-node-18.exe"
$ArtifactWindowsBinary = Join-Path $BinaryDir "$ApplicationName.exe"
$ArtifactWindows18BinaryOut = "$ApplicationName-v$CurrentVersion-win64-node-18.exe"
$ArtifactLinuxBinary = Join-Path $BinaryDir "$ApplicationName"
$ArtifactLinux18BinaryOut = "$ApplicationName-v$CurrentVersion-linux64-node-18"
# Remove old binary files
Remove-Item (Join-Path $BinaryDir $ArtifactWindowsInstaller18BinaryOut) -ErrorAction Ignore
Remove-Item (Join-Path $BinaryDir $ArtifactWindows18BinaryOut) -ErrorAction Ignore
Remove-Item (Join-Path $BinaryDir $ArtifactLinux18BinaryOut) -ErrorAction Ignore
# Extract binary files and rename them
Expand-Archive $ArtifactWindowsInstaller18 -DestinationPath $BinaryDir -Force
Rename-Item -Path $ArtifactWindowsInstallerBinary -NewName $ArtifactWindowsInstaller18BinaryOut
Expand-Archive $ArtifactLinux18 -DestinationPath $BinaryDir -Force
Rename-Item -Path $ArtifactLinuxBinary -NewName $ArtifactLinux18BinaryOut
Expand-Archive $ArtifactWindows18 -DestinationPath $BinaryDir -Force
Rename-Item -Path $ArtifactWindowsBinary -NewName $ArtifactWindows18BinaryOut

# Go back to the call directory
Set-Location $CallDir

# Wait for any input before closing the window
Write-Host "`n>> The script has finished. Press any key to close the window."
[Console]::ReadKey()
