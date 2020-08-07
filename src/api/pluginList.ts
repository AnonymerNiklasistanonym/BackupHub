import type { AbruneggOneDrive } from "../plugins/abruneggOnedrive";
import type { CopyFiles } from "../plugins/copyFiles";
import type { Grive } from "../plugins/grive";
import type { Pacman } from "../plugins/pacman";
import type { Rsync } from "../plugins/rsync";

export type PluginList = Rsync.PluginName | AbruneggOneDrive.PluginName | Grive.PluginName |
CopyFiles.PluginName | Pacman.PluginName;
