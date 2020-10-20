import type { AbruneggOneDrive } from "../plugins/abruneggOnedrive";
import type { CopyFiles } from "../plugins/copyFiles";
import type { Git } from "../plugins/git";
import type { GitHub } from "../plugins/github";
import type { GitLab } from "../plugins/gitlab";
import type { Grive } from "../plugins/grive";
import type { Pacman } from "../plugins/pacman";
import type { Rsync } from "../plugins/rsync";

export type PluginList = Rsync.PluginName
| AbruneggOneDrive.PluginName
| Git.PluginName
| GitHub.PluginName
| GitLab.PluginName
| Grive.PluginName
| CopyFiles.PluginName
| Pacman.PluginName
| string;
