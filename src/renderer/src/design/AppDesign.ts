import * as Shared from "mod_companion_shared";

export const Icons = {
    Asset: "mingcute:traffic-cone-fill",
    Model: "mingcute:box-3-fill",
    Texture: "mingcute:pic-fill",
    Material: "mingcute:balloon-2-fill",

    Dot: "lucide:dot",
    Check: "mingcute:check-line",
    Loading: "mingcute:loading-line",
    Filter: "mingcute:filter-3-line",
    Search: "mingcute:search-2-line",
    Save: "mingcute:save-2-fill",
    CollapseVertical: "mingcute:fold-vertical-line",
    ExpandVertical: "mingcute:unfold-vertical-line",
    ChevronUp: "mingcute:up-line",
    ChevronDown: "mingcute:down-line",
    ChevronLeft: "mingcute:left-line",
    ChevronRight: "mingcute:right-line",
    ArrowUp: "mingcute:arrow-up-line",
    ArrowDown: "mingcute:arrow-down-line",
    ArrowLeft: "mingcute:arrow-left-line",
    ArrowRight: "mingcute:arrow-right-line",
    Ellipsis: "mingcute:more-1-line",
    EllipsisVertical: "mingcute:more-2-line",
    Home: "mingcute:home-3-fill",
    Close: "mingcute:close-line",
    Copy: "mingcute:copy-2-line",
    Bulb: "mingcute:bulb",
    Question: "mingcute:question-fill",
    NetworkConnected: "mingcute:wifi-fill",
    NetworkDisconnected: "mingcute:wifi-off-fill",
    Cloud: "mingcute:cloud-fill",
    InteropConnected: "mingcute:transfer-fill",
    LinkExternal: "mingcute:external-link-line",

    Conversion: "mingcute:lightning-fill",

    FsFolder: "mingcute:folder-fill",
    FsFolderOpen: "mingcute:folder-open-fill",
    FsFile: "mingcute:file-fill",
    FsImage: "mingcute:pic-fill",
    FsCode: "mingcute:file-code-fill",

    SystemMinimize: "mingcute:minimize-fill",
    SystemMaximize: "mingcute:fullscreen-fill",
    SystemClose: "mingcute:close-fill",

    ActionAdd: "mingcute:add-line",
    ActionRemove: "mingcute:minimize-line",
    ActionSend: "mingcute:send-fill",

    ActionConvertAsset: "mingcute:large-arrow-right-fill",
    ActionCreateAsset: "mingcute:add-line",
    ActionCreateAssetGroup: "mingcute:new-folder-fill",
    ActionCompileMap: "mingcute:large-arrow-right-fill",

    ActionBrowseToFolder: "mingcute:folder-2-fill",
    ActionExploreToFolder: "mingcute:folder-2-fill",

    ActionMcaFile: "mingcute:file-star-fill",
    ActionExploreToDefinition: "mingcute:folder-star-fill",
    ActionBrowseToDefinition: "mingcute:folder-star-fill",
    ActionOpenFileDefinition: "mingcute:file-star-fill",

    ActionLaunchFile: "mingcute:play-fill",
    ActionEdit: "mingcute:edit-line",
    ActionEditPencil: "mingcute:edit-2-fill",
    ActionSelectCursor: "mingcute:cursor-fill",
    ActionDelete: "mingcute:delete-fill",

    ActionPlay: "mingcute:play-fill",
    ActionPause: "mingcute:pause-fill",
    ActionStop: "mingcute:stop-fill",

    ActionRefresh: "mingcute:refresh-3-line",
    ActionMinimize: "mingcute:minimize-fill",
    ActionDownload: "mingcute:download-2-line",

    MapCompileIdle: "lucide:dot",
    MapCompileInProgress: "mingcute:loading-line",
    MapCompileCompleted: "mingcute:check-line",

    ConversionStateInvalid: "mingcute:alert-fill",
    ConversionStateUnknown: "mingcute:question-fill",
    ConversionStatePending: "lucide:dot",
    ConversionStateInProgress: "mingcute:loading-line",
    ConversionStateFinished: "mingcute:checks-line",
    ConversionStateFailed: "mingcute:close-line",
    ConversionStateNoChange: "mingcute:check-line",

    ImageViewer_Action_Fill: "mingcute:fullscreen-fill",

    Panel_MapList: "mingcute:map-2-fill",
    Panel_MapCompileLog: "mingcute:list-check-fill",
    Panel_AssetBrowser: "mingcute:document-3-fill",
    Panel_FileBrowser: "mingcute:folder-open-fill",
    Panel_FileInspector: "mingcute:document-fill",
    Panel_AssetInspector: "mingcute:edit-4-fill",
    Panel_AssetInspector_TexturePreview: "mingcute:pic-fill",
    Panel_AssetInspector_TextureMetadata: "mingcute:layer-fill",
    Panel_AssetInspector_TextureConvert: "mingcute:settings-2-fill",
    Panel_AssetInspector_TextureChannels: "mingcute:layout-grid-fill",
    Panel_AssetInspector_TextureHotspotEditor: "mingcute:layout-9-line",
    Panel_AssetInspector_General: "mingcute:list-check-fill",
    Panel_Conversions: "mingcute:list-check-2-fill",
    Panel_ConversionDetails: "mingcute:lightning-fill",
    Panel_GameConsole: "mingcute:terminal-fill",

    TakeOver_AssetWizard: "mingcute:traffic-cone-fill",
    TakeOver_Log: "mingcute:list-check-fill",
    TakeOver_DevTools: "mingcute:list-check-fill",

    Log: "mingcute:list-check-fill",
    LogType_Debug: "mingcute:bug-fill",
    LogType_Info: "mingcute:information-fill",
    LogType_Warning: "mingcute:alert-fill",
    LogType_Error: "mingcute:alert-fill",
} as const;

export const BitmapIcon = {
    Launchers: {
        [Shared.Launchers.Launchers.Game]: "revolution",
        [Shared.Launchers.Launchers.Hammer]: "hammer",
        [Shared.Launchers.Launchers.Faceposer]: "faceposer",
        [Shared.Launchers.Launchers.Hlmv]: "hlmv",
    },
    ModCompanion: "mod_companion_192",
} as const;

export function getAssetTypeIcon(type: Shared.Asset.Type): string {
    switch (type) {
        case Shared.Asset.Types.Texture:
            return Icons.Texture;
        case Shared.Asset.Types.Model:
            return Icons.Model;
        case Shared.Asset.Types.Material:
            return Icons.Material;
        case Shared.Asset.Types.Unknown:
        default:
            return Icons.Asset;
    }
}
export function getAssetTypeTextColor(type: Shared.Asset.Type): string {
    switch (type) {
        case Shared.Asset.Types.Texture:
            return "text-blue-400";
        case Shared.Asset.Types.Model:
            return "text-pink-400";
        case Shared.Asset.Types.Material:
            return "text-orange-400";
        case Shared.Asset.Types.Unknown:
        default:
            return "text-neutral-500";
    }
}

export function getAssetTypeName(type: Shared.Asset.Type) {
    switch (type) {
        case Shared.Asset.Types.Model: {
            return "Model";
        }
        case Shared.Asset.Types.Texture: {
            return "Texture";
        }
        case Shared.Asset.Types.Material: {
            return "Material";
        }
        default:
        case Shared.Asset.Types.Unknown: {
            return "Unknown";
        }
    }
}

export function getLogTypeIcon(logType: Shared.Log.Type) {
    switch (logType) {
        case Shared.Log.Type.Debug: {
            return Icons.LogType_Debug;
        }
        case Shared.Log.Type.Info: {
            return Icons.LogType_Info;
        }
        case Shared.Log.Type.Warning: {
            return Icons.LogType_Warning;
        }
        case Shared.Log.Type.Error: {
            return Icons.LogType_Error;
        }
    }
}

export function getLogTypeTextColor(logType: Shared.Log.Type): string {
    switch (logType) {
        case Shared.Log.Type.Debug: {
            return "text-magenta-400";
        }
        case Shared.Log.Type.Info: {
            return "text-info-400";
        }
        case Shared.Log.Type.Warning: {
            return "text-yellow-400";
        }
        case Shared.Log.Type.Error: {
            return "text-red-400";
        }
    }
}

export function getLogTypeTextColorWarnings(logType: Shared.Log.Type): string {
    switch (logType) {
        case Shared.Log.Type.Debug:
        case Shared.Log.Type.Info: {
            return "";
        }
        case Shared.Log.Type.Warning: {
            return "text-yellow-400";
        }
        case Shared.Log.Type.Error: {
            return "text-red-400";
        }
    }
}

export const AppDesign = {
    Icons,
    BitmapIcon,
};
