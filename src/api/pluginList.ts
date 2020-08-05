import type { AbruneggOneDrive } from "../plugins/abruneggOnedrive";
import type { Grive } from "../plugins/grive";
import type { Rsync } from "../plugins/rsync";

export type PluginList = Rsync.PluginName | AbruneggOneDrive.PluginName | Grive.PluginName;
