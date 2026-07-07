import path from "path";
import fs from "fs/promises";
import os from "node:os";
import { S3ClientConfig } from "@aws-sdk/client-s3";
import { Logger } from "./CoreLogSystem.js";
import * as Shared from "mod_companion_shared";
import * as pathe from "pathe";

interface ConfigFile {
    root?: string;
    searchPath?: string;
    launcherName?: string;

    assetDefaults?: {
        vtfOptions?: Shared.Vtf.SharedVtfCreateOptions;
    };

    teamCityArtifactCloud?: S3ClientConfig;
    teamCityArtifactCloudBucket?: string;

    mapSourceDirs?: string[];
    mapPresets?: Shared.Map.SharedMapPresets;
}

let config: Shared.AppConfig.AppConfig = null!;

export const ConfigSystem = {
    getAppConfig(): Shared.AppConfig.AppConfig {
        return config;
    },

    async initConfigSystem(): Promise<boolean> {
        let cfgFile = await _loadConfig();

        if (cfgFile === undefined) {
            Logger.info(Shared.Log.Channel.MainSystems, "Starting with default config");
            cfgFile = _createDefaultConfig();
        }

        const cfg = _createRevolutionStandardConfig(cfgFile);
        if (!cfg) return false;

        config = cfg;
        return true;
    },
};

function _createRevolutionStandardConfig(c: ConfigFile): Shared.AppConfig.AppConfig | undefined {
    if (!c.root) {
        return undefined;
    }
    if (!c.searchPath) {
        return undefined;
    }

    const root = pathe.resolve(c.root);
    return {
        gameName: c.searchPath,
        rootPath: root,
        contentPath: pathe.join(root, "content", c.searchPath),
        gamePath: pathe.join(root, "game", c.searchPath),
        gameRootPath: pathe.join(root, "game"),

        textureSourcePath: pathe.join(root, "content", c.searchPath, "materialsrc"),
        textureOutputPath: pathe.join(root, "game", c.searchPath, "materials"),
        modelSourcePath: pathe.join(root, "content", c.searchPath, "models"),
        modelOutputPath: pathe.join(root, "game", c.searchPath, "models"),
        mapSourcePath: pathe.join(root, "content", c.searchPath, "maps"),
        mapOutputPath: pathe.join(root, "game", c.searchPath, "maps"),
        scriptsPath: pathe.join(root, "game", c.searchPath, "scripts"),

        studioMdlPath: _buildBinaryPath(root, "studiomdl"),
        hlmvPath: _buildBinaryPath(root, "hlmv", true),
        hammerPath: _buildBinaryPath(root, "hammer", true),
        faceposerPath: _buildBinaryPath(root, "hlfaceposer", true),
        mdlInfoPath: _buildBinaryPath(root, "mdlinfo"),
        gameExePath: _buildBinaryPath(root, c.launcherName ?? "revolution"),

        vbspExePath: _buildBinaryPath(root, "vbsp"),
        postcompilerExePath: pathe.join(root, "game/bin/win64/postcompiler/postcompiler.exe"),
        vvisExePath: _buildBinaryPath(root, "vvis"),
        vradExePath: _buildBinaryPath(root, "vrad"),

        vbspArgs: `-report -game ${c.searchPath}`,
        postcompilerArgs: "--nopack",
        vvisArgs: `-report -game ${c.searchPath}`,
        vradArgs: `-report -PortalTraversalLighting -textureshadows -StaticPropLighting -StaticPropPolys -game ${c.searchPath}`,
        cubemapArgs: "-buildcubemaps -novid -windowed -w 800 -h 600 -condebug -bordered",

        mapSourceDirs: c.mapSourceDirs,
        mapPresets: c.mapPresets,

        assetDefaults: c.assetDefaults,
        teamCityArtifactCloud: c.teamCityArtifactCloud,
        teamCityArtifactCloudBucket: c.teamCityArtifactCloudBucket,
    };
}

function _buildBinaryPath(root: string, binaryName: string, proton?: boolean): string {
    const platform = os.platform();
    if (platform === "linux" && !proton) {
        return path.join(root, "game/bin/linux64", binaryName);
    }

    if (platform === "win32" || proton) {
        return path.join(root, "game/bin/win64", binaryName + ".exe");
    }

    Logger.info(Shared.Log.Channel.MainSystems, "Unsupported operating system platform", platform);
    return path.join(root, binaryName);
}

function _getConfigPath(): string {
    return path.normalize("./appconfig.json");
}

function _createDefaultConfig(): ConfigFile {
    return {
        root: "sample",
        searchPath: "my_game",
    };
}

async function _loadConfig(): Promise<ConfigFile | undefined> {
    try {
        const rawCfg = await fs.readFile(_getConfigPath());

        const cfgAny = JSON.parse(rawCfg.toString("utf-8"));

        if (!cfgAny.root || typeof cfgAny.root !== "string") {
            return undefined;
        }

        if (!cfgAny.searchPath || typeof cfgAny.searchPath !== "string") {
            return undefined;
        }

        return cfgAny;
    } catch (e) {
        Logger.error(Shared.Log.Channel.MainSystems, "Error loading config", e);
        return undefined;
    }
}
