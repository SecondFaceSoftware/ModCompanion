import { SharedVtfCreateOptions } from "./SharedVtf.js";
import * as pathe from "pathe";
import { VmtDocument } from "./SharedAssetMaterial.js";
import { makeContentPathAbsolute, makeGamePathAbsolute } from "./SharedSourceFs.js";
import { createPath, Path, PathBases } from "./SharedPaths.js";

export type AssetId = string;
export type AssetMap = Map<AssetId, Asset>;

export const McaFileExt = ".mca"; // Mod Companion Asset
export const QcFileExt = ".qc";
export const VmtFileExt = ".vmt";

export function isMcaFile(filePath: string): boolean {
    return pathe.extname(filePath).toLowerCase() === McaFileExt;
}

export function isQcFile(filePath: string): boolean {
    return pathe.extname(filePath).toLowerCase() === QcFileExt;
}

export function isVmtFile(filePath: string): boolean {
    return pathe.extname(filePath).toLowerCase() === VmtFileExt;
}

export const Types = {
    Unknown: "unknown",
    Texture: "texture",
    Model: "model",
    Material: "material",
} as const;
export type Type = (typeof Types)[keyof typeof Types];

export function isValidAssetType(str: string): str is Type {
    return (Object.values(Types) as string[]).includes(str);
}

export function getAssetTypeName(type: Type): string {
    switch (type) {
        case Types.Texture: {
            return "Texture";
        }
        case Types.Model: {
            return "Model";
        }
        case Types.Material: {
            return "Material";
        }
        case Types.Unknown:
        default: {
            return "Unknown";
        }
    }
}

export function hasGameFiles(type: Type): boolean {
    switch (type) {
        case Types.Texture:
        case Types.Material:
        case Types.Model:
            return true;
        case Types.Unknown:
        default:
            return false;
    }
}

export function hasContentFiles(type: Type): boolean {
    switch (type) {
        case Types.Texture:
        case Types.Model:
            return true;
        case Types.Material:
        case Types.Unknown:
        default:
            return false;
    }
}

export const ValidTypes = [Types.Texture, Types.Model, Types.Material];
export const UserSelectableTypes = [Types.Texture];

export interface AssetDefFileArrays {
    readonly contentFiles?: string[];
    readonly gameFiles?: string[];
}

/**
 * JSON data structure for .mca files. Gets read and written to disk
 */
export interface AssetDef extends AssetDefFileArrays {
    id: string;
    type: Type;
    displayName?: string;

    associatedFiles?: AssociatedFiles;
    credits?: string;
}

export interface Asset {
    /** Asset definition data read from the mca file or generated implicitly */
    readonly def: AssetDef;

    /** Path to the asset's source file like .mca or .qc path */
    readonly defFilePath?: string;

    /** When true, this asset was generated at app start and doesn't live in disk */
    readonly isTransient?: boolean;
}

export interface AssociatedFiles {
    substanceDesigner?: string;
    substancePainter?: string;
    blender?: string;
}

export interface AssociatedFilesEntry {
    field: keyof AssociatedFiles;
    name: string;
    icon: string;
}

export const AssociatedFilesEntries: AssociatedFilesEntry[] = [
    {
        field: "substanceDesigner",
        name: "Designer",
        icon: "substance:designer",
    },
    {
        field: "substancePainter",
        name: "Painter",
        icon: "substance:painter",
    },
    {
        field: "blender",
        name: "Blender",
        icon: "file-icons:blender",
    },
];

export function getAssociatedEntryName(field: keyof AssociatedFiles) {
    return AssociatedFilesEntries.find((value) => value.field === field);
}

export interface AssetRescanEvent {
    assets: Map<AssetId, Asset>;
    totalTimeMillis?: number;
}

export type AssetRescanNotifyFunc = (event: AssetRescanEvent) => void;

export interface AssetAddedEvent {
    assets: Asset[];
}

export interface AssetUpdatedEvent {
    assets: Asset[];
}

export interface TextureAsset extends Asset {
    /** @inheritDoc */
    readonly def: TextureAssetDef;
}

export type AssetUpdatedNotifyFunc = (event: AssetUpdatedEvent) => void;

export interface TextureAssetDef extends AssetDef {
    type: typeof Types.Texture;
    vtfOptions?: SharedVtfCreateOptions;
}

export function isTextureAssetDef(asset: AssetDef | undefined): asset is TextureAssetDef {
    return asset?.type === Types.Texture;
}

export function isTextureAsset(asset: Asset | undefined): asset is TextureAsset {
    return isTextureAssetDef(asset?.def);
}

export interface ModelAssetDef extends AssetDef {
    type: typeof Types.Model;
}

export interface ModelAsset extends Asset {
    /** @inheritDoc */
    readonly def: ModelAssetDef;
}

export function isModelAssetDef(asset: AssetDef | undefined): asset is ModelAssetDef {
    return asset?.type === Types.Model;
}

export interface MaterialAssetDef extends AssetDef {
    type: typeof Types.Material;
    vmtDocument?: VmtDocument;
}

export interface MaterialAsset extends Asset {
    /** @inheritDoc */
    readonly def: MaterialAssetDef;
}

export function isMaterialAssetDef(asset: AssetDef | undefined): asset is MaterialAssetDef {
    return asset?.type === Types.Material;
}

export function isMaterialAsset(asset: Asset | undefined): asset is MaterialAsset {
    return isMaterialAssetDef(asset?.def);
}

// ------------------------

export function getGameFilePaths(assets: Asset[]): Path[] {
    const paths: Path[] = [];
    for (const asset of assets) {
        if (!asset.def.gameFiles) continue;
        if (asset.def.gameFiles.length === 0) continue;
        for (const gameFile of asset.def.gameFiles) {
            paths.push(createPath(gameFile, PathBases.Game));
        }
    }

    return paths;
}

export function getContentFilePaths(assets: Asset[]): Path[] {
    const paths: Path[] = [];
    for (const asset of assets) {
        if (!asset.def.contentFiles) continue;
        if (asset.def.contentFiles.length === 0) continue;
        for (const contentFile of asset.def.contentFiles) {
            paths.push(createPath(contentFile, PathBases.Content));
        }
    }

    return paths;
}

// ------------------------

export enum SharedCreateAssetReportType {
    ErrorUnknown,
    ErrorFileAlreadyUsedInAsset,
    Success,
}

interface BaseSharedCreateAssetReport {
    type: SharedCreateAssetReportType;
}

interface UnknownError extends BaseSharedCreateAssetReport {
    type: SharedCreateAssetReportType.ErrorUnknown;
}

interface FilesAlreadyUsedInAssetError extends BaseSharedCreateAssetReport {
    type: SharedCreateAssetReportType.ErrorFileAlreadyUsedInAsset;
    filesAlreadyUsed: string[];
    asset: AssetId;
}

interface Success extends BaseSharedCreateAssetReport {
    type: SharedCreateAssetReportType.Success;
    assets: Asset[];
}

export type SharedCreateAssetReport = UnknownError | FilesAlreadyUsedInAssetError | Success;
