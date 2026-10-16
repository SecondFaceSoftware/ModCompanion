import { forwardSlashed } from "./SharedSourceFs.js";
import { getCommonPrefix, removeTrailing } from "./SharedString.js";
import * as sourcelib from "sourcelib";
import { changeExtension, createPath, Path, PathBases, stripExtension, transformPathBase } from "./SharedPaths.js";
import { AppConfig } from "./SharedAppConfig.js";

export interface VmtFile {
    filePath: Path;
    contents: Record<string, any>;
    shaderName: string;
}

export function serializeMaterial(vmt: VmtFile): string {
    const serialized = sourcelib.kv.KvSerializer.serialize(vmt.contents, {
        name: vmt.shaderName,
        indentSpaces: 4,
    });
    return serialized;
}

export function createAutoMaterial(vtfFiles: Path[], config: AppConfig): VmtFile | undefined {
    const texturePaths = vtfFiles.map((v) => transformPathBase(v, PathBases.GameMaterial, config)) as Path[];
    if (texturePaths.some((t) => t === undefined)) return undefined;
    const texturePathStrings = texturePaths.map((v) => stripExtension(v!).path);

    const baseTexture = texturePathStrings.find(isMaybeBaseTexture);
    const normalMap = texturePathStrings.find(isMaybeNormalMap);
    const mraoMap = texturePathStrings.find(isMaybeMraoMap);

    const isProbablyModelMaterial = isMaybeModelMaterial(vtfFiles);
    const isProbablyPbr = baseTexture && normalMap && mraoMap;
    const isProbablyLightmappedGeneric = baseTexture && !isProbablyModelMaterial;
    const isProbablyVertexlitGeneric = baseTexture && isProbablyModelMaterial;

    const filePath = guessMaterialPath(texturePaths, texturePathStrings);

    if (isProbablyPbr) {
        const pbrMaterial: Record<string, any> = {
            $basetexture: baseTexture,
            $bumpmap: normalMap,
            $mraotexture: mraoMap,
        };
        if (isProbablyModelMaterial) {
            pbrMaterial["$model"] = 1;
        }
        return { filePath, contents: pbrMaterial, shaderName: "PBR" };
    } else if (isProbablyLightmappedGeneric) {
        const lightmappedMaterial = {
            $basetexture: baseTexture,
            ...(normalMap ? { $bumpmap: normalMap } : {}),
        };
        return { filePath, contents: lightmappedMaterial, shaderName: "LightMappedGeneric" };
    } else if (isProbablyVertexlitGeneric) {
        const vertexlitMaterial = {
            $basetexture: baseTexture,
            ...(normalMap ? { $bumpmap: normalMap } : {}),
        };
        return { filePath, contents: vertexlitMaterial, shaderName: "VertexLitGeneric" };
    }

    return undefined;
}

export function guessMaterialPath(vtfsPaths: Path[], vtfPathStrings: string[]): Path {
    if (vtfsPaths.length === 1) {
        return changeExtension(vtfsPaths[0], ".vmt");
    }

    const commonPrefix = getCommonPrefix(vtfPathStrings);
    const commonPrefixTrimmed = removeTrailing(commonPrefix, "_");
    return createPath(commonPrefixTrimmed + ".vmt", PathBases.GameMaterial);
}

export function isMaybeModelMaterial(fullVtfPaths: Path[]): boolean {
    let couldBeModelScore = 0;
    for (const fullVtfPath of fullVtfPaths) {
        const splits = forwardSlashed(fullVtfPath.path).split("/");

        if (splits.includes("model") || splits.includes("models")) {
            couldBeModelScore++;
        }
    }

    const isProbablyModelMaterial = couldBeModelScore > fullVtfPaths.length / 2;
    return isProbablyModelMaterial;
}

export function isMaybeBaseTexture(fileNameWithoutExt: string) {
    if (fileNameWithoutExt.endsWith("_basetexture")) return true;
    if (fileNameWithoutExt.endsWith("_base")) return true;
    if (fileNameWithoutExt.endsWith("_color")) return true;
    if (fileNameWithoutExt.endsWith("_colour")) return true;
    if (fileNameWithoutExt.endsWith("_basecolor")) return true;
    if (fileNameWithoutExt.endsWith("_basecolour")) return true;
    if (fileNameWithoutExt.endsWith("_diffuse")) return true;
    if (fileNameWithoutExt.endsWith("_d")) return true;
    return false;
}

export function isMaybeNormalMap(fileNameWithoutExt: string) {
    if (fileNameWithoutExt.endsWith("_normal")) return true;
    if (fileNameWithoutExt.endsWith("_bump")) return true;
    if (fileNameWithoutExt.endsWith("_n")) return true;
    return false;
}

export function isMaybeMraoMap(fileNameWithoutExit: string) {
    if (fileNameWithoutExit.endsWith("_mrao")) return true;
    if (fileNameWithoutExit.endsWith("_mrao_tintmask")) return true;
    return false;
}
