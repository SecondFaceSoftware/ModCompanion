import * as pathe from "pathe";
import fs from "fs/promises";
import os from "node:os";
import { S3ClientConfig } from "@aws-sdk/client-s3";
import { Logger } from "./CoreLogSystem.js";
import * as Shared from "mod_companion_shared";
import { existsSync } from "fs";
import * as z from "zod";

const AppConfigFileSchema = z.object({
    project: z.string(),
});

type AppConfigFile = z.infer<typeof AppConfigFileSchema>;

const ProjectConfigFileSchema = z.object({
    root: z.optional(z.string()),
    searchPath: z.optional(z.string()),
    steamAppId: z.optional(z.coerce.number()),
    launcherName: z.optional(z.string()),
    assetDefaults: z.optional(
        z.object({
            vtfOptions: z.optional(z.object<Shared.Vtf.SharedVtfCreateOptions>()),
        }),
    ),
    artifactCloud: z.optional(
        z.object({
            s3: z.object({
                clientConfig: z.object<S3ClientConfig>(),
                bucket: z.string(),
                mapsPrefix: z.string(),
            }),
        }),
    ),
    mapSourceDirs: z.optional(z.array(z.string())),
    mapPresets: z.optional(z.record(z.string(), z.array(z.string()))),
});

type ProjectConfigFile = z.infer<typeof ProjectConfigFileSchema>;

let config: Shared.AppConfig.AppConfig = null!;

export const ConfigSystem = {
    getAppConfig(): Shared.AppConfig.AppConfig {
        return config;
    },

    async initConfigSystem(): Promise<boolean> {
        const projectConfig = await _loadProjectConfig();

        if (projectConfig === undefined) {
            Logger.error(Shared.Log.Channel.MainSystems, "No project config found. Qutting");
            return false;
        }

        const cfg = _createConfig(projectConfig.cfg, projectConfig.cfgPath);
        if (!cfg) return false;

        config = cfg;
        return true;
    },
};

function _createConfig(c: ProjectConfigFile, cfgPath: string): Shared.AppConfig.AppConfig | undefined {
    if (!c.root) {
        return undefined;
    }
    if (!c.searchPath) {
        return undefined;
    }

    const root = pathe.resolve(pathe.join(pathe.dirname(cfgPath), c.root));
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

        assetDefaults: c.assetDefaults as Shared.AppConfig.AppConfigAssetDefaults,
        artifactCloud: c.artifactCloud,
    };
}

function _buildBinaryPath(root: string, binaryName: string, proton?: boolean): string {
    const platform = os.platform();
    if (platform === "linux" && !proton) {
        return pathe.join(root, "game/bin/linux64", binaryName);
    }

    if (platform === "win32" || proton) {
        return pathe.join(root, "game/bin/win64", binaryName + ".exe");
    }

    return pathe.join(root, binaryName);
}

function _getAppConfigPath(): string {
    return pathe.normalize("./appconfig.json");
}

async function _loadAppConfig(): Promise<AppConfigFile | undefined> {
    const cfgPath = _getAppConfigPath();
    try {
        const rawCfg = await fs.readFile(cfgPath, "utf-8");
        const cfgAny = JSON.parse(rawCfg);
        const parsedCfg = AppConfigFileSchema.safeParse(cfgAny);
        if (!parsedCfg.success) {
            Logger.error(Shared.Log.Channel.MainSystems, `Failed to parse ${cfgPath}`, parsedCfg.error.message);
            return undefined;
        }

        return parsedCfg.data;
    } catch (e) {
        Logger.error(Shared.Log.Channel.MainSystems, "Error loading app config", e);
        return undefined;
    }
}

async function _loadProjectConfig(): Promise<{ cfg: ProjectConfigFile; cfgPath: string } | undefined> {
    const appConfig = await _loadAppConfig();
    if (!appConfig) {
        Logger.error(Shared.Log.Channel.MainSystems, "Error loading project config. App config is missing");
        return undefined;
    }

    const projectConfigPath = pathe.resolve(appConfig?.project);
    if (!existsSync(projectConfigPath)) {
        Logger.error(Shared.Log.Channel.MainSystems, `Project config '${projectConfigPath}' does not exist`);
        return undefined;
    }

    try {
        const stat = await fs.stat(projectConfigPath);
        if (!stat.isFile()) {
            Logger.error(
                Shared.Log.Channel.MainSystems,
                `Project config '${projectConfigPath}' is a directory. Must be a file path. Probably called projectconfig.json`,
            );
            return undefined;
        }

        const rawCfg = await fs.readFile(projectConfigPath, "utf8");

        const cfgAny = JSON.parse(rawCfg);

        if (!cfgAny.root || typeof cfgAny.root !== "string") {
            Logger.error(Shared.Log.Channel.MainSystems, "Error loading project config. root property not set");
            return undefined;
        }

        if (!cfgAny.searchPath || typeof cfgAny.searchPath !== "string") {
            Logger.error(Shared.Log.Channel.MainSystems, "Error loading project config. searchPath property not set");
            return undefined;
        }

        return { cfg: cfgAny as ProjectConfigFile, cfgPath: projectConfigPath };
    } catch (e) {
        Logger.error(Shared.Log.Channel.MainSystems, "Error loading project config", e);
        return undefined;
    }
}
