import * as Shared from "mod_companion_shared";

export const AssetCreationInferResults = {
    Unknown: "unknown",
    Texture: "texture",
} as const;
export type AssetCreationInferResult = (typeof AssetCreationInferResults)[keyof typeof AssetCreationInferResults];

export function inferAssetCreationType(files: string[]): AssetCreationInferResult {
    if (files.length < 1) return AssetCreationInferResults.Unknown;

    if (_allTextureFiles(files)) {
        return AssetCreationInferResults.Texture;
    }

    return AssetCreationInferResults.Unknown;
}

function _allTextureFiles(files: string[]): boolean {
    for (const file of files) {
        if (!_isTextureFile(file)) return false;
    }

    return true;
}

function _isTextureFile(file: string): boolean {
    for (const ending of Shared.FileEndings.texturesFileEndings) {
        if (file.endsWith(ending)) return true;
    }

    return false;
}
