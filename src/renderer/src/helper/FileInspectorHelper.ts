import pathe from "pathe";
import { DefineComponent } from "vue";
import { AppDesign } from "~/design/AppDesign.js";
import FilePreviewModel from "~/components/panels/fileInspector/previews/FilePreviewModel.vue";
import FilePreviewImage from "~/components/panels/fileInspector/previews/FilePreviewImage.vue";
import FilePreviewText from "~/components/panels/fileInspector/previews/FilePreviewText.vue";
import FilePreviewMap from "~/components/panels/fileInspector/previews/FilePreviewMap.vue";
import FilePreviewChamberSign from "~/components/panels/fileInspector/previews/FilePreviewChamberSign.vue";
import * as Shared from "mod_companion_shared";
import FilePreviewTexture from "~/components/panels/fileInspector/previews/FilePreviewTexture.vue";

export enum FileInspectors {
    Unknown,
    Text,
    Image,
    Model,
    Texture,
    Map,
    ChamberSign,
}

export enum FileType {
    Unknown,
    TextMca,
    TextVmt,
    TextQc,
    TextGeneric,
    TextJsonChamberSign,
    ImagePng,
    ImageJpg,
    Mdl,
    Vtf,
    Vmf,
}

const FileTypeNames: Record<FileType, string> = {
    [FileType.Unknown]: "Unknown",
    [FileType.TextMca]: "Mod Companion Asset",
    [FileType.TextVmt]: "Material",
    [FileType.TextQc]: "Model Compile Config",
    [FileType.TextGeneric]: "Text",
    [FileType.TextJsonChamberSign]: "Chamber Sign Config",
    [FileType.ImagePng]: "PNG",
    [FileType.ImageJpg]: "JPG",
    [FileType.Mdl]: "Model Definition",
    [FileType.Vtf]: "Texture",
    [FileType.Vmf]: "Hammer Map",
};

export function getFileTypeName(fileType: FileType): string {
    return FileTypeNames[fileType];
}

export function getFileTypeIcon(fileType: FileType): string {
    switch (fileType) {
        case FileType.ImagePng:
        case FileType.ImageJpg:
            return AppDesign.Icons.FsImage;
        case FileType.TextMca:
            return AppDesign.Icons.Asset;
        case FileType.TextQc:
            return AppDesign.Icons.FsCode;
        default:
            return AppDesign.Icons.FsFile;
    }
}

export function getFileType(fileName: string): FileType {
    if (fileName === Shared.FileNames.chamberSignConfig) {
        return FileType.TextJsonChamberSign;
    }

    const ext = pathe.extname(fileName);
    if (ext === ".mca") return FileType.TextMca;
    if (ext === ".vmt") return FileType.TextVmt;
    if (ext === ".qc") return FileType.TextQc;

    if (ext === ".txt") return FileType.TextGeneric;
    if (ext === ".kv") return FileType.TextGeneric;
    if (ext === ".vdf") return FileType.TextGeneric;
    if (ext === ".vcd") return FileType.TextGeneric; // Todo: Add file preview for scenes with button to open in faceposer
    if (ext === ".json") return FileType.TextGeneric;
    if (ext === ".yml") return FileType.TextGeneric;
    if (ext === ".log") return FileType.TextGeneric;
    if (ext === ".bat") return FileType.TextGeneric;
    if (ext === ".sh") return FileType.TextGeneric;
    if (ext === ".md") return FileType.TextGeneric;
    if (ext === ".fgd") return FileType.TextGeneric;
    if (ext === ".inf") return FileType.TextGeneric;
    if (ext === ".rad") return FileType.TextGeneric;
    if (ext === ".nut") return FileType.TextGeneric;
    if (ext === ".res") return FileType.TextGeneric;
    if (ext === ".cfg") return FileType.TextGeneric;
    if (ext === ".js") return FileType.TextGeneric;
    if (ext === ".xml") return FileType.TextGeneric;
    if (ext === ".html") return FileType.TextGeneric;
    if (ext === ".css") return FileType.TextGeneric;
    if (ext === ".scss") return FileType.TextGeneric;

    if (ext === ".png") return FileType.ImagePng;
    if (ext === ".jpg") return FileType.ImageJpg;
    if (ext === ".mdl") return FileType.Mdl;
    if (ext === ".vtf") return FileType.Vtf;
    if (ext === ".vmf") return FileType.Vmf;

    return FileType.Unknown;
}

export function getFileInspectorFromType(fileType: FileType): FileInspectors {
    switch (fileType) {
        case FileType.TextGeneric:
        case FileType.TextVmt:
        case FileType.TextMca:
        case FileType.TextQc: {
            return FileInspectors.Text;
        }
        case FileType.TextJsonChamberSign: {
            return FileInspectors.ChamberSign;
        }
        case FileType.ImagePng:
        case FileType.ImageJpg: {
            return FileInspectors.Image;
        }
        case FileType.Mdl: {
            return FileInspectors.Model;
        }
        case FileType.Vtf: {
            return FileInspectors.Texture;
        }
        case FileType.Vmf: {
            return FileInspectors.Map;
        }
        case FileType.Unknown:
        default: {
            return FileInspectors.Unknown;
        }
    }
}

export type FileInspectorComponent = DefineComponent<{ path: string }, any, any>;

export function getFileInspectorComponent(inspector: FileInspectors): FileInspectorComponent | undefined {
    switch (inspector) {
        case FileInspectors.Text:
            return FilePreviewText;
        case FileInspectors.Image:
            return FilePreviewImage;
        case FileInspectors.Model:
            return FilePreviewModel;
        case FileInspectors.Map:
            return FilePreviewMap;
        case FileInspectors.ChamberSign:
            return FilePreviewChamberSign;
        case FileInspectors.Texture:
            return FilePreviewTexture;
        default:
        case FileInspectors.Unknown:
            return undefined;
    }
}

export function hasEditor(inspector: FileInspectors): boolean {
    if (inspector === FileInspectors.ChamberSign) return true;

    return false;
}
