import { SharedVtfCreateOptions } from "./SharedVtf.js";

export interface AppConfigAssetDefaults {
    vtfOptions?: SharedVtfCreateOptions;
}

/**
 * Runtime representation of the app's config. This is not data directly loaded from disk or meant to be saved, but
 * it represents some common file paths and game or app related configurations that can be accessed from anywhere
 * */
export interface AppConfig {
    /**
     * Path of the repo root directory
     * Represents: <repo>/
     * */
    rootPath: string;

    /**
     * Path of the content folder in the repo with the search path appended
     * Represents: <repo>/content/<search_path>
     * */
    contentPath: string;

    /**
     * Path of the game folder in the repo with the search path appended
     * Represents: <repo>/game/<search_path>
     * */
    gamePath: string;

    /**
     * Path of the game folder in the repo
     * Represents: <repo>/game
     * */
    gameRootPath: string;

    /**
     * Path to the materials content folder
     * Represents: <repo>/content/<search_path>/materialsrc
     * */
    textureSourcePath: string;

    /**
     * Path to the materials game folder
     * Represents: <repo>/game/<search_path>/materials
     * */
    textureOutputPath: string;

    /**
     * Path to the models content folder
     * Represents: <repo>/game/<search_path>/models
     * */
    modelSourcePath: string;

    /**
     * Path to the models game folder
     * Represents: <repo>/game/<search_path>/models
     * */
    modelOutputPath: string;

    /**
     * Path to the scripts game folder
     * Represents: <repo>/game/<search_path>/scripts
     * */
    scriptsPath: string;

    /**
     * Path to the map source folder
     * Represents: <repo>/content/<search_path>/maps
     * */
    mapSourcePath: string;

    /**
     * Path to the map output folder
     * Represents: <repo>/game/<search_path>/maps
     * */
    mapOutputPath: string;

    studioMdlPath: string;
    hlmvPath: string;
    hammerPath: string;
    faceposerPath: string;
    mdlInfoPath: string;
    gameExePath: string;

    vbspExePath: string;
    vradExePath: string;
    vvisExePath: string;
    postcompilerExePath: string;

    vbspArgs: string;
    vradArgs: string;
    vvisArgs: string;
    postcompilerArgs: string;
    cubemapArgs: string;

    /** Default search path. e.g. "revolution" */
    gameName: string;

    assetDefaults?: AppConfigAssetDefaults;

    artifactCloud?: {
        s3?: {
            clientConfig?: any; //S3ClientConfig;
            bucket?: string;
            mapsPrefix?: string;
        };
    };

    assetDiscovery?: {
        /** Root relative paths that should be searched for assets */
        contentInclude?: string[];
    };
    conversionAgent?: {
        /** Root relative paths that should be automatically converted when the files change */
        autoConvertPaths?: string[];
    };
}
