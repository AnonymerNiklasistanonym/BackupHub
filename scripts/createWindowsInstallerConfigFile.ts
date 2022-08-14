// Package imports
import path from "path";
// Local imports
import { createWindowsInstallerConfigFile } from "../src/documentation/windowsInstaller";
import { fileNameWindowsInstallerConfig } from "../src/info/fileNames";

const filePathWindowsInstallConfig = path.join(
  __dirname,
  "..",
  fileNameWindowsInstallerConfig
);
console.log(
  `Create Windows installer config file '${filePathWindowsInstallConfig}'...`
);
createWindowsInstallerConfigFile(filePathWindowsInstallConfig).catch(
  console.error
);
