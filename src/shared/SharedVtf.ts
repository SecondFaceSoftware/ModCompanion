// -------------------------------

export const SharedVtfVersions = {
    v74: "7.4",
    v75: "7.5",
    v76: "7.6",
} as const;
export type SharedVtfVersion = (typeof SharedVtfVersions)[keyof typeof SharedVtfVersions];
export const SharedVtfDefaultVersion = SharedVtfVersions.v76;

export function getVtfVersionName(version: SharedVtfVersion): string {
    switch (version) {
        case SharedVtfVersions.v74:
            return "7.4 (Orange Box)";
        case SharedVtfVersions.v75:
            return "7.5 (Alien Swarm)";
        case SharedVtfVersions.v76:
            return "7.6 (Strata)";
        default:
            return version;
    }
}

export function createVtfVersion(major: number, minor: number): SharedVtfVersion | undefined {
    const str = `${major}.${minor}`;
    if ((Object.values(SharedVtfVersions) as string[]).includes(str)) {
        return str as SharedVtfVersion;
    } else {
        return undefined;
    }
}

// -------------------------------

export interface SharedVtfCreateOptions {
    version?: SharedVtfVersion;
    format?: SharedVtfImageFormat;
    filter?: SharedVtfFilter;
    flags?: SharedVtfFlag[];
    noMips?: boolean;
    noAnimation?: boolean;
    noThumbnail?: boolean;
    compressionMethod?: SharedVtfCompressionMethod;
    compressionLevel?: number;
    bumpScale?: number;
    gammaCorrect?: boolean;

    /**
     *  The quality of DXTn/BCn format compression, between 0.0 and 1.0. Higher quality will take significantly longer to create the texture.
     *  Ignored if output format is uncompressed.
     *  default: 0.105
     */
    quality?: number;

    /**
     * Default: 2.2. This is a string and not a number because of floating point precision
     */
    gammaCorrectAmount?: string;

    hotspot?: SharedVtfHotspotRect[];
}

export type SharedVtfCreateEnumOptions =
    | typeof SharedVtfVersions
    | typeof SharedVtfImageFormats
    | typeof SharedVtfFilters
    | typeof SharedVtfCompressionMethods;

export type SharedVtfCreateNumberOptions = "compressionLevel" | "bumpScale";

// Original:
// "format"
// {
//         "platform" "PC"
//         "version_major" "7"
//         "version_minor" "6"
// }
// "image"
// {
//         "format" "BC7"
//         "dimensions"
//         {
//                 "width" "2048"
//                 "height" "2048"
//                 "depth" "1"
//                 "mips" "12"
//                 "frames" "1"
//                 "faces" "1"
//         }
//         "flags" "8192"
//         "reflectivity"
//         {
//                 "r" "0.8289776"
//                 "g" "0.82898"
//                 "b" "0.82898"
//         }
//         "start_frame" "0"
//         "bumpmap_scale" "1"
//         "mip_scale" "0"
//         "compression"
//         {
//                 "method" "DEFLATE"
//                 "level" "6"
//         }
// }
// "resources"
// {
//         "thumbnail"
//         {
//                 "present" "1"
//                 "format" "DXT1"
//                 "width" "16"
//                 "height" "16"
//         }
//         "palette"
//         {
//                 "present" "0"
//         }
//         "fallback"
//         {
//                 "present" "0"
//                 "width" "0"
//                 "height" "0"
//                 "mips" "0"
//         }
// }

export interface SharedVtfInfoRawOutput {
    format: {
        platform: string;
        version_major: number;
        version_minor: number;
    };
    image: {
        format: string;
        dimensions: {
            width: number;
            height: number;
            depth: number;
            mips: number;
            frames: number;
            faces: number;
        };
        flags: number;
        reflectivity: {
            r: number;
            g: number;
            b: number;
        };
        start_frame: number;
        bumpmap_scale: number;
        mip_scale: number;
        compression: {
            method: string;
            level: number;
        };
    };
    resources: {
        thumbnail: {
            present: number;
            format: string;
            width: number;
            height: number;
        };
        palette: {
            present: number;
        };
        fallback: {
            present: number;
            width: number;
            height: number;
            mips: number;
        };
    };
}

export interface SharedVtfInfoFormat {
    platform?: string;
    version?: SharedVtfVersion;
}

export interface SharedVtfInfoImage {
    format?: SharedVtfImageFormat;
    dimensions: {
        width: number;
        height: number;
        depth: number;
        mips: number;
        frames: number;
        faces: number;
    };
    flags: SharedVtfFlag[];
    reflectivity: { r: number; g: number; b: number };
    startFrame: number;
    bumpMapScale: number;
    mipScale: number;
    compression?: {
        method: SharedVtfCompressionMethod;
        level: number;
    };
}

export interface SharedVtfInfoResources {
    thumbnail: {
        preset: boolean;
        format?: SharedVtfImageFormat;
        width?: number;
        height?: number;
    };
    palette: {
        present: boolean;
    };
    fallback: {
        present: boolean;
        width?: number;
        height?: number;
        mips?: number;
    };
}

export interface SharedVtfInfo {
    format?: SharedVtfInfoFormat;
    image?: SharedVtfInfoImage;
    resources?: SharedVtfInfoResources;
}

export function buildMareTfCreateArgs(options: SharedVtfCreateOptions): string {
    let a = "";

    if (options.version) {
        a += ` --version ${options.version}`;
    }
    if (options.flags) {
        for (const flags of options.flags) {
            a += ` --flag ${flags}`;
        }
    }
    if (options.format) {
        a += ` --format ${options.format}`;
    }
    if (options.filter) {
        a += ` --filter ${options.filter}`;
    }
    if (options.noMips) {
        a += ` --no-mips`;
    }
    if (options.noAnimation) {
        a += ` --no-animation`;
    }
    if (options.noThumbnail) {
        a += ` --no-thumbnail`;
    }
    if (options.compressionMethod) {
        a += ` --compression-method ${options.compressionMethod}`;
    }
    if (options.compressionLevel) {
        a += ` --compression-level ${options.compressionLevel}`;
    }
    if (options.bumpScale) {
        a += ` --bump-scale ${options.bumpScale}`;
    }
    if (options.gammaCorrect) {
        a += ` --gamma-correct`;
    }
    if (options.gammaCorrectAmount) {
        a += ` --gamma-correct-amount ${options.gammaCorrectAmount}`;
    }
    if (options.quality) {
        a += ` --quality ${options.quality}`;
    }
    if (options.hotspot) {
        for (const hotspot of options.hotspot) {
            a += ` --hotspot-rect ${hotspot.x0} ${hotspot.y0} ${hotspot.x1} ${hotspot.y1}`;

            const flagsArr: string[] = [];
            if (hotspot.flags?.randomRotation) {
                flagsArr.push("RANDOM_ROTATION");
            }
            if (hotspot.flags?.randomReflection) {
                flagsArr.push("RANDOM_REFLECTION");
            }
            if (hotspot.flags?.isAlternative) {
                flagsArr.push("IS_ALTERNATIVE");
            }

            if (flagsArr.length > 0) {
                const flagsStr = flagsArr.join(",");
                a += " " + flagsStr;
            } else {
                a += " NONE";
            }
        }
    }

    return a;
}

// -------------------------------

export interface SharedVtfEnumGrouping<T> {
    groups: SharedVtfEnumGroup<T>[];
    ungrouped: T[];
}

export interface SharedVtfEnumGroup<T> {
    label: string;
    items: T[];
}

export function getUngrouped<T>(groups: SharedVtfEnumGroup<T>[], allItems: T[]): T[] {
    const ungrouped = Object.values(allItems);

    for (const group of groups) {
        for (const flag of group.items) {
            const idx = ungrouped.indexOf(flag);
            ungrouped.splice(idx, 1);
        }
    }

    return ungrouped;
}

export function createGrouping<T>(groups: SharedVtfEnumGroup<T>[], allItems: T[]): SharedVtfEnumGrouping<T> {
    return {
        groups,
        ungrouped: getUngrouped(groups, allItems),
    };
}

// -------------------------------

export const SharedVtfFlags = {
    PointSample: "POINT_SAMPLE",
    Trilinear: "TRILINEAR",
    ClampS: "CLAMP_S",
    ClampT: "CLAMP_T",
    Anisotropic: "ANISOTROPIC",
    HintDXT5: "HINT_DXT5",
    Normal: "NORMAL",
    NoMip: "NO_MIP",
    NoLod: "NO_LOD",
    Procedural: "PROCEDURAL",
    OneBitAlpha: "ONE_BIT_ALPHA",
    MultiBitAlpha: "MULTI_BIT_ALPHA",
    Envmap: "ENVMAP",
    RenderTarget: "RENDERTARGET",
    DepthRenderTarget: "DEPTH_RENDERTARGET",
    NodeBugOverride: "NO_DEBUG_OVERRIDE",
    SingleCopy: "SINGLE_COPY",
    NoDepthBuffer: "NO_DEPTH_BUFFER",
    ClampU: "CLAMP_U",
    LoadAllMips: "LOAD_ALL_MIPS",
    VertexTexture: "VERTEX_TEXTURE",
    SSBump: "SSBUMP",
    Border: "BORDER",
    SRGB_V4: "SRGB_V4",
    TF2StagingMemory: "TF2_STAGING_MEMORY",
    TF2ImmediateCleanup: "TF2_IMMEDIATE_CLEANUP",
    TF2IgnorePicMip: "TF2_IGNORE_PICMIP",
    TF2StreamableCoarse: "TF2_STREAMABLE_COARSE",
    TF2StreamableFine: "TF2_STREAMABLE_FINE",
    PwlCorrected: "PWL_CORRECTED",
    SRGB_V5: "SRGB_V5",
    DefaultPool: "DEFAULT_POOL",
    LoadMostMips: "LOAD_MOST_MIPS",
    CsgoCombined: "CSGO_COMBINED",
    CsgoAsyncDownload: "CSGO_ASYNC_DOWNLOAD",
    CsgoSkipInitialDownload: "CSGO_SKIP_INITIAL_DOWNLOAD",
    CsgoYCOCG: "CSGO_YCOCG",
    CsgoAsyncSkipInitialLowRes: "CSGO_ASYNC_SKIP_INITIAL_LOW_RES",
} as const;
export type SharedVtfFlag = (typeof SharedVtfFlags)[keyof typeof SharedVtfFlags];

export function createVtfFlagsArray(bits: number): SharedVtfFlag[] {
    return [];
}

export const SharedVtfFlagVersionMap = new Map<SharedVtfFlag, SharedVtfVersion>([
    [SharedVtfFlags.PointSample, SharedVtfVersions.v74],
    [SharedVtfFlags.Trilinear, SharedVtfVersions.v74],
    [SharedVtfFlags.ClampS, SharedVtfVersions.v74],
    [SharedVtfFlags.ClampT, SharedVtfVersions.v74],
    [SharedVtfFlags.Anisotropic, SharedVtfVersions.v74],
    [SharedVtfFlags.HintDXT5, SharedVtfVersions.v74],
    [SharedVtfFlags.Normal, SharedVtfVersions.v74],
    [SharedVtfFlags.NoMip, SharedVtfVersions.v74],
    [SharedVtfFlags.NoLod, SharedVtfVersions.v74],
    [SharedVtfFlags.Procedural, SharedVtfVersions.v74],
    [SharedVtfFlags.OneBitAlpha, SharedVtfVersions.v74],
    [SharedVtfFlags.MultiBitAlpha, SharedVtfVersions.v74],
    [SharedVtfFlags.Envmap, SharedVtfVersions.v74],
    [SharedVtfFlags.RenderTarget, SharedVtfVersions.v74],
    [SharedVtfFlags.DepthRenderTarget, SharedVtfVersions.v74],
    [SharedVtfFlags.NodeBugOverride, SharedVtfVersions.v74],
    [SharedVtfFlags.SingleCopy, SharedVtfVersions.v74],
    [SharedVtfFlags.NoDepthBuffer, SharedVtfVersions.v74],
    [SharedVtfFlags.ClampU, SharedVtfVersions.v74],
    [SharedVtfFlags.LoadAllMips, SharedVtfVersions.v74],
    [SharedVtfFlags.VertexTexture, SharedVtfVersions.v74],
    [SharedVtfFlags.SSBump, SharedVtfVersions.v74],
    [SharedVtfFlags.Border, SharedVtfVersions.v74],
    [SharedVtfFlags.SRGB_V4, SharedVtfVersions.v74],
    [SharedVtfFlags.TF2StagingMemory, SharedVtfVersions.v74],
    [SharedVtfFlags.TF2ImmediateCleanup, SharedVtfVersions.v74],
    [SharedVtfFlags.TF2IgnorePicMip, SharedVtfVersions.v74],
    [SharedVtfFlags.TF2StreamableCoarse, SharedVtfVersions.v74],
    [SharedVtfFlags.TF2StreamableFine, SharedVtfVersions.v74],
    [SharedVtfFlags.PwlCorrected, SharedVtfVersions.v75],
    [SharedVtfFlags.SRGB_V5, SharedVtfVersions.v75],
    [SharedVtfFlags.DefaultPool, SharedVtfVersions.v75],
    [SharedVtfFlags.LoadMostMips, SharedVtfVersions.v75],
    [SharedVtfFlags.CsgoCombined, SharedVtfVersions.v75],
    [SharedVtfFlags.CsgoAsyncDownload, SharedVtfVersions.v75],
    [SharedVtfFlags.CsgoSkipInitialDownload, SharedVtfVersions.v75],
    [SharedVtfFlags.CsgoYCOCG, SharedVtfVersions.v75],
    [SharedVtfFlags.CsgoAsyncSkipInitialLowRes, SharedVtfVersions.v75],
]);

export const SharedVtfFlagDeprecated: SharedVtfFlag[] = [
    SharedVtfFlags.Trilinear,
    SharedVtfFlags.Anisotropic,
    SharedVtfFlags.PointSample,
];

export interface SharedVtfFlagGroup {
    label: string;
    flags: SharedVtfFlag[];
}
const SharedVtfFlagGroups: SharedVtfEnumGroup<SharedVtfFlag>[] = [
    {
        label: "Common Flags",
        items: [
            SharedVtfFlags.Normal,
            SharedVtfFlags.PointSample,
            SharedVtfFlags.Anisotropic,
            SharedVtfFlags.Trilinear,
            SharedVtfFlags.ClampS,
            SharedVtfFlags.ClampT,
        ],
    },
];

let flagGrouping: SharedVtfEnumGrouping<SharedVtfFlag> | undefined;
export function getVtfFlagGrouping() {
    if (!flagGrouping) {
        flagGrouping = createGrouping(SharedVtfFlagGroups, Object.values(SharedVtfFlags));
    }

    return flagGrouping;
}
// -------------------------------

export const SharedVtfCompressionMethods = {
    None: "",
    Deflate: "DEFLATE",
    Zstd: "ZSTD",
    ConsoleLzma: "CONSOLE_LZMA",
} as const;
export type SharedVtfCompressionMethod = (typeof SharedVtfCompressionMethods)[keyof typeof SharedVtfCompressionMethods];
export const SharedVtfDefaultCompressionMethod = SharedVtfCompressionMethods.Deflate;
export const SharedVtfDefaultCompressionLevel = 6;

export function createVtfCompressionMethod(str: string): SharedVtfCompressionMethod {
    if ((Object.values(SharedVtfCompressionMethods) as string[]).includes(str)) {
        return str as SharedVtfCompressionMethod;
    } else {
        return SharedVtfCompressionMethods.None;
    }
}

export function getVtfCompressionMethodName(compressionMethod: SharedVtfCompressionMethod): string {
    switch (compressionMethod) {
        case SharedVtfCompressionMethods.None: {
            return "None";
        }
        case SharedVtfCompressionMethods.Deflate: {
            return "Deflate";
        }
        case SharedVtfCompressionMethods.Zstd: {
            return "ZSTD";
        }
        case SharedVtfCompressionMethods.ConsoleLzma: {
            return "LZMA (Console Only)";
        }
        default: {
            return compressionMethod;
        }
    }
}

export function isVtfCompressionMethodDisabled(compressionMethod: SharedVtfCompressionMethod): boolean {
    return compressionMethod === SharedVtfCompressionMethods.ConsoleLzma;
}

// -------------------------------

export const SharedVtfFilters = {
    Default: "DEFAULT",
    Box: "BOX",
    Bilinear: "BILINEAR",
    CubicBSpline: "CUBIC_BSPLINE",
    CatmullRom: "CATMULL_ROM",
    Mitchell: "MITCHELL",
    PointSample: "POINT_SAMPLE",
    Kaiser: "KAISER",
    Nice: "NICE",
} as const;
export type SharedVtfFilter = (typeof SharedVtfFilters)[keyof typeof SharedVtfFilters];
export const SharedVtfDefaultFilter = SharedVtfFilters.Default;

export function getVtfFilterName(version: SharedVtfFilter): string {
    switch (version) {
        case SharedVtfFilters.Default:
            return "Auto";
        case SharedVtfFilters.Box:
            return "Box";
        case SharedVtfFilters.Bilinear:
            return "Bilinear";
        case SharedVtfFilters.CubicBSpline:
            return "Cubic B-Spline";
        case SharedVtfFilters.CatmullRom:
            return "Catmull Rom";
        case SharedVtfFilters.Mitchell:
            return "Mitchell";
        case SharedVtfFilters.PointSample:
            return "Point Sample";
        case SharedVtfFilters.Kaiser:
            return "Kaiser";
        case SharedVtfFilters.Nice:
            return "Nice";
        default:
            return version;
    }
}

// -------------------------------

export const SharedVtfImageFormats = {
    Unchanged: "UNCHANGED",
    Default: "DEFAULT",
    RGBA8888: "RGBA8888",
    ABGR8888: "ABGR8888",
    RGB888: "RGB888",
    BGR888: "BGR888",
    RGB565: "RGB565",
    I8: "I8",
    IA88: "IA88",
    P8: "P8",
    A8: "A8",
    RGB888Bluescreen: "RGB888_BLUESCREEN",
    BGR888Bluescreen: "BGR888_BLUESCREEN",
    ARGB8888: "ARGB8888",
    BGRA8888: "BGRA8888",
    DXT1: "DXT1",
    DXT3: "DXT3",
    DXT5: "DXT5",
    BGRX8888: "BGRX8888",
    BGR565: "BGR565",
    BGRX5551: "BGRX5551",
    BGRA4444: "BGRA4444",
    DXT1OneBitAlpha: "DXT1_ONE_BIT_ALPHA",
    BGRA5551: "BGRA5551",
    UV88: "UV88",
    UVWQ8888: "UVWQ8888",
    RGBA16161616F: "RGBA16161616F",
    RGBA16161616: "RGBA16161616",
    UVLX8888: "UVLX8888",
    R32F: "R32F",
    RGB323232F: "RGB323232F",
    RGBA32323232F: "RGBA32323232F",
    RG1616F: "RG1616F",
    RG3232F: "RG3232F",
    RGBX8888: "RGBX8888",
    // empty: "EMPTY",
    ATI2N: "ATI2N",
    ATI1N: "ATI1N",
    RGBA1010102: "RGBA1010102",
    BGRA1010102: "BGRA1010102",
    R16F: "R16F",
    ConsoleBGRX8888Linear: "CONSOLE_BGRX8888_LINEAR",
    ConsoleRGBA8888Linear: "CONSOLE_RGBA8888_LINEAR",
    ConsoleABGR8888Linear: "CONSOLE_ABGR8888_LINEAR",
    ConsoleARGB8888Linear: "CONSOLE_ARGB8888_LINEAR",
    ConsoleBGRA8888Linear: "CONSOLE_BGRA8888_LINEAR",
    ConsoleRGB888Linear: "CONSOLE_RGB888_LINEAR",
    ConsoleBGR888Linear: "CONSOLE_BGR888_LINEAR",
    ConsoleBGRX5551Linear: "CONSOLE_BGRX5551_LINEAR",
    ConsoleI8Linear: "CONSOLE_I8_LINEAR",
    ConsoleRGBA16161616Linear: "CONSOLE_RGBA16161616_LINEAR",
    ConsoleBGRX8888LE: "CONSOLE_BGRX8888_LE",
    ConsoleBGRA8888LE: "CONSOLE_BGRA8888_LE",
    R8: "R8",
    BC7: "BC7",
    BC6H: "BC6H",
} as const;
export type SharedVtfImageFormat = (typeof SharedVtfImageFormats)[keyof typeof SharedVtfImageFormats];
export const SharedVtfDefaultImageFormat = SharedVtfImageFormats.BC7;

export function createVtfImageFormat(formatStr: string): SharedVtfImageFormat | undefined {
    if ((Object.values(SharedVtfImageFormats) as string[]).includes(formatStr)) {
        return formatStr as SharedVtfImageFormat;
    } else {
        return undefined;
    }
}

const SharedVtfImageFormatGroups: SharedVtfEnumGroup<SharedVtfImageFormat>[] = [
    {
        label: "Common",
        items: ["BC7", "BC6H", "RGB888", "RGBA8888", "RGBA16161616", "RGBA16161616F", "RGBA32323232F"],
    },
    {
        label: "Special",
        items: ["DEFAULT", "UNCHANGED"],
    },
    {
        label: "Single Channel",
        items: ["R8", "R16F", "R32F", "I8", "P8", "A8"],
    },
    {
        label: "DXT",
        items: ["DXT1", "DXT1_ONE_BIT_ALPHA", "DXT3", "DXT5"],
    },
    {
        label: "Bluescreen",
        items: ["RGB888_BLUESCREEN", "BGR888_BLUESCREEN"],
    },
] as const;

let formatGrouping: SharedVtfEnumGrouping<SharedVtfImageFormat> | undefined;
export function getVtfImageFormatGrouping() {
    if (!formatGrouping) {
        formatGrouping = createGrouping(SharedVtfImageFormatGroups, Object.values(SharedVtfImageFormats));
    }

    return formatGrouping;
}

export function getVtfFormatName(format: SharedVtfImageFormat): string {
    switch (format) {
        case SharedVtfImageFormats.BGR888Bluescreen:
            return "BGR888 Bluescreen";
        case SharedVtfImageFormats.RGB888Bluescreen:
            return "RGB888 Bluescreen";
        case SharedVtfImageFormats.DXT1OneBitAlpha:
            return "DXT1 One Bit Alpha";
        case SharedVtfImageFormats.Unchanged:
            return "Infer from source file";
        case SharedVtfImageFormats.Default:
            return "Auto";
        default:
            return format;
    }
}

export function isVtfFormatDisabled(format: SharedVtfImageFormat): boolean {
    if (format.startsWith("CONSOLE")) return true;

    return false;
}

// -------------------------------

export interface SharedVtfHotspotRect {
    x0: number;
    y0: number;
    x1: number;
    y1: number;
    flags?: SharedVtfHotspotRectFlags;
}

export interface SharedVtfHotspotRectFlags {
    randomRotation?: boolean;
    randomReflection?: boolean;
    isAlternative?: boolean;
}

export function isVtfHotspotRectFlagsEqual(
    flags1: SharedVtfHotspotRectFlags | undefined,
    flags2: SharedVtfHotspotRectFlags | undefined,
): boolean {
    return (
        (flags1 === undefined) === (flags2 === undefined) &&
        flags1?.randomRotation === flags2?.randomRotation &&
        flags1?.randomReflection === flags2?.randomReflection &&
        flags1?.isAlternative === flags2?.isAlternative
    );
}
