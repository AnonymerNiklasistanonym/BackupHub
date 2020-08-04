import type { AbruneggOneDrive } from "../plugins/abruneggOnedrive";
import type { Rsync } from "../plugins/rsync";

export type PluginList = Rsync.PluginName | AbruneggOneDrive.PluginName;
