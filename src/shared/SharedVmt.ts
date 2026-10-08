import { forwardSlashed } from "./SharedSourceFs.js";
import { getCommonPrefix, removeTrailing } from "./SharedString.js";
import * as pathe from "pathe";
import * as sourcelib from "sourcelib";

export interface VmtFile {
    // Root relative
    filePath: string;
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

export function createAutoMaterial(vtfRelativeToRoot: string[]): VmtFile | undefined {
    const textureNames = vtfRelativeToRoot.map(rootRelativeToMaterialPath);

    const baseTexture = textureNames.find(isMaybeBaseTexture);
    const normalMap = textureNames.find(isMaybeNormalMap);
    const mraoMap = textureNames.find(isMaybeMraoMap);

    const isProbablyModelMaterial = isMaybeModelMaterial(vtfRelativeToRoot);
    const isProbablyPbr = baseTexture && normalMap && mraoMap;
    const isProbablyLightmappedGeneric = baseTexture && !isProbablyModelMaterial;
    const isProbablyVertexlitGeneric = baseTexture && isProbablyModelMaterial;

    const filePath = guessMaterialPath(vtfRelativeToRoot) + ".vmt";

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

export function guessMaterialPath(vtfs: string[]): string {
    if (vtfs.length === 1) {
        return vtfs[0].replace(".vtf", "");
    }
    const commonPrefix = removeTrailing(getCommonPrefix(vtfs), "_");
    return commonPrefix;
}

export function isMaybeModelMaterial(fullVtfPaths: string[]): boolean {
    let couldBeModelScore = 0;
    for (const fullVtfPath of fullVtfPaths) {
        const splits = forwardSlashed(fullVtfPath).split("/");

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

// TODO: Replace with path api
export function rootRelativeToMaterialPath(vtfPath: string): string {
    const ext = pathe.extname(vtfPath);
    const result = vtfPath.replace(ext, "");
    const splits = forwardSlashed(result).split("/");
    for (let i = 0; i < splits.length; i++) {
        const split = splits[i];
        if (split === "materials") {
            const trimmed = splits.slice(i + 1).join("/");
            return trimmed;
        }
    }

    return result;
}
