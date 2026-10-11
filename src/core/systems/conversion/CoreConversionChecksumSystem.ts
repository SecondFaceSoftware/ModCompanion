import { ConfigSystem } from "../CoreConfigSystem.js";
import * as pathe from "pathe";
import fs from "fs/promises";
import crypto from "node:crypto";
import { Logger } from "../CoreLogSystem.js";
import * as Shared from "mod_companion_shared";
import { TaskSystem } from "../CoreTaskSystem.js";

export const ConversionChecksumSystem = {
    checksums: new Map<Shared.Asset.AssetId, string>(),
    enabled: false,

    async initChecksums(map: Map<Shared.Asset.AssetId, Shared.Asset.Asset>) {
        if (!this.enabled) {
            Logger.info(Shared.Log.Channel.ConversionAgent, `Created no checksums because the system is disabled`);
            return;
        }

        TaskSystem.startTask({ taskId: Shared.Task.TaskIds.AssetChecksum, quantityGoal: map.size });
        const { millis } = await Shared.Timing.timeMillisAsync(async () => {
            let progress = 0;
            for (const [assetId, asset] of map) {
                if (!asset.def.contentFiles) return;

                const sum = await this.createChecksum(asset.def.contentFiles);
                this.checksums.set(asset.def.id, sum);

                progress++;
                TaskSystem.updateTask(Shared.Task.TaskIds.AssetChecksum, progress);
            }
        });
        TaskSystem.endTask(Shared.Task.TaskIds.AssetChecksum);
        Logger.info(Shared.Log.Channel.ConversionAgent, `Initialized asset checksums in`, millis, "ms");
    },
    async createChecksum(contentFiles: string[]) {
        const contentPath = ConfigSystem.getAppConfig().contentPath;

        const promises = contentFiles.map(async (f) => {
            const p = pathe.join(contentPath, f);
            try {
                const fileContents = await fs.readFile(p, "base64");
                const hash = crypto.createHash("sha1").update(fileContents).digest("base64");
                return hash;
            } catch (e) {
                Logger.warning(Shared.Log.Channel.ConversionAgent, `Failed to create asset checksum for`, p);
                Logger.warning(Shared.Log.Channel.ConversionAgent, e);
                return "";
            }
        });

        const results = await Promise.all(promises);
        const sum = results.join();
        return sum;
    },
    async hasChanged(asset: Shared.Asset.AssetDef): Promise<boolean> {
        if (!this.enabled) return false;
        if (asset.contentFiles === undefined || asset.contentFiles.length === 0) return false;

        const newSum = await this.createChecksum(asset.contentFiles);
        const oldSum = this.checksums.get(asset.id);

        if (newSum !== oldSum) {
            this.checksums.set(asset.id, newSum);
            return true;
        } else {
            return false;
        }
    },
};
