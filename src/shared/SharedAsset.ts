import { SharedVtfCreateOptions } from "./SharedVtf.js";
import pathe from "pathe";

export type AssetId = string;

export const McaFileExt = ".mca"; // Mod Companion Asset
export const QcFileExt = ".qc";

export function isMcaFile(filePath: string): boolean {
    return pathe.extname(filePath).toLowerCase() === McaFileExt;
}

export function isQcFile(filePath: string): boolean {
    return pathe.extname(filePath).toLowerCase() === QcFileExt;
}

export const Types = {
    Unknown: "unknown",
    Texture: "texture",
    Model: "model",
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
        case Types.Unknown:
        default: {
            return "Unknown";
        }
    }
}

export const ValidTypes = [Types.Texture, Types.Model];

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

export interface Asset {
    /** Asset definition data read from the mca file or generated implicitly */
    readonly def: AssetDef;

    /** Path to the asset's source file like .mca or .qc path */
    readonly defFilePath?: string;

    /** When true, this asset was generated at app start and doesn't live in disk */
    readonly isTransient?: boolean;
}

export interface TextureAsset extends Asset {
    /** @inheritDoc */
    readonly def: TextureAssetDef;
}

export interface AssetRescanEvent {
    assets: Map<AssetId, Asset>;
    potentialAssets: Asset[];
    totalTimeMillis?: number;
}

export type AssetRescanNotifyFunc = (event: AssetRescanEvent) => void;

export interface AssetAddedEvent {
    assets: Asset[];
}

export interface AssetUpdatedEvent {
    assets: Asset[];
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

export function isModelAssetDef(asset: AssetDef | undefined): asset is ModelAssetDef {
    return asset?.type === Types.Model;
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
