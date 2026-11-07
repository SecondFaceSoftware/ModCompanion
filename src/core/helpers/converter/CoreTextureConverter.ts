import * as pathe from "pathe";
import { MareTfSystem } from "../../systems/CoreMaretfSystem.js";
import { ConfigSystem } from "../../systems/CoreConfigSystem.js";
import * as Shared from "mod_companion_shared";

export const TextureConverter = {
    isValid(asset: Shared.Asset.TextureAssetDef): boolean {
        return (
            asset.contentFiles !== undefined &&
            asset.contentFiles?.length === 1 &&
            asset.gameFiles !== undefined &&
            asset.gameFiles?.length === 1
        );
    },
    async convert(asset: Shared.Asset.TextureAssetDef): Promise<string | undefined> {
        if (!this.isValid(asset)) return undefined;
        const srcFileRel = asset.contentFiles![0];
        const config = ConfigSystem.getAppConfig();
        const srcFile = pathe.join(config.contentPath, srcFileRel);

        const outFileRel = asset.gameFiles![0];
        const outFile = pathe.join(config.gamePath, outFileRel);

        const finalOptions = structuredClone(config.assetDefaults?.vtfOptions ?? {}) as any;

        if (asset.vtfOptions) {
            for (const [key, value] of Object.entries(asset.vtfOptions)) {
                if (Array.isArray(value) && value.length > 0) {
                    finalOptions[key] = value;
                } else if (value !== undefined && value !== null && !Array.isArray(value)) {
                    finalOptions[key] = value;
                }
            }
        }
        return MareTfSystem.createVtf(srcFile, outFile, finalOptions);
    },
};
