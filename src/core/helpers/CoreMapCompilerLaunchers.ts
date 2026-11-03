import * as child_process from "node:child_process";
import { ConfigSystem } from "../systems/CoreConfigSystem.js";
import * as pathe from "pathe";
import fs from "fs/promises";
import { Logger } from "../systems/CoreLogSystem.js";
import * as Shared from "mod_companion_shared";

export type MapCompilerAction = (
    mapName: string,
    onStdOut?: (msg: string) => void,
    onStdErr?: (msg: string) => void,
) => Promise<boolean>;

export const runVBsp: MapCompilerAction = (
    mapName: string,
    onStdOut?: (msg: string) => void,
    onStdErr?: (msg: string) => void,
): Promise<boolean> => {
    const config = ConfigSystem.getAppConfig();
    return _runMapCompiler(mapName, config.vbspExePath, config.vbspArgs, onStdOut, onStdErr);
};

export const runVVis: MapCompilerAction = (
    mapName: string,
    onStdOut?: (msg: string) => void,
    onStdErr?: (msg: string) => void,
): Promise<boolean> => {
    const config = ConfigSystem.getAppConfig();
    return _runMapCompiler(mapName, config.vvisExePath, config.vvisArgs, onStdOut, onStdErr);
};

export const runVRad: MapCompilerAction = (
    mapName: string,
    onStdOut?: (msg: string) => void,
    onStdErr?: (msg: string) => void,
): Promise<boolean> => {
    const config = ConfigSystem.getAppConfig();
    return _runMapCompiler(mapName, config.vradExePath, config.vradArgs, onStdOut, onStdErr);
};

export const runPostcompiler: MapCompilerAction = (
    mapName: string,
    onStdOut?: (msg: string) => void,
    onStdErr?: (msg: string) => void,
): Promise<boolean> => {
    const config = ConfigSystem.getAppConfig();
    return _runMapCompiler(mapName, config.postcompilerExePath, config.postcompilerArgs, onStdOut, onStdErr);
};

export const runDone: MapCompilerAction = async (
    mapName: string,
    onStdOut?: (msg: string) => void,
    onStdErr?: (msg: string) => void,
): Promise<boolean> => {
    const config = ConfigSystem.getAppConfig();
    const relativeMapPath = Shared.Paths.createPath(mapName, Shared.Paths.PathBases.ContentMaps);
    const from = Shared.Paths.changeExtension(relativeMapPath, ".bsp");
    const to = Shared.Paths.getBspPathFromVmfPath(relativeMapPath);
    if (!to) {
        Logger.warning(
            Shared.Log.Channel.MapCompile,
            "Cannot run compiler action because",
            from,
            "doesn't map to a valid bsp path",
        );
        return false;
    }

    const absFrom = Shared.Paths.transformPathBase(from, Shared.Paths.PathBases.Absolute, config);
    const absTo = Shared.Paths.transformPathBase(to, Shared.Paths.PathBases.Absolute, config);

    if (!absFrom || !absTo) {
        Logger.warning(
            Shared.Log.Channel.MapCompile,
            "Cannot run compiler action because",
            from,
            to,
            "don't map to absolute paths",
        );
        return false;
    }

    const absFromPath = absFrom.path;
    const absToPath = absTo.path;

    try {
        await fs.copyFile(absFromPath, absToPath);
        onStdOut?.(`Copied file ${absFromPath} ${absToPath}`);
        return true;
    } catch {
        onStdErr?.(`Failed to copy file ${absFromPath} ${absToPath}`);
        return false;
    }
};

async function _runMapCompiler(
    mapName: string,
    exePath: string,
    args: string,
    onStdOut?: (msg: string) => void,
    onStdErr?: (msg: string) => void,
): Promise<boolean> {
    const config = ConfigSystem.getAppConfig();
    const relativeMapPath = Shared.Paths.createPath(mapName, Shared.Paths.PathBases.ContentMaps);
    const absMapPath = Shared.Paths.transformPathBase(relativeMapPath, Shared.Paths.PathBases.Absolute, config);
    if (!absMapPath) {
        return false;
    }
    const cwd = pathe.join(config.rootPath, "game");

    return _runCommand(exePath, [...args.split(" "), absMapPath.path], cwd, onStdOut, onStdErr);
}

function _runCommand(
    binaryPath: string,
    args: string[],
    cwd: string,
    onStdOut?: (msg: string) => void,
    onStdErr?: (msg: string) => void,
): Promise<boolean> {
    Logger.info(Shared.Log.Channel.MapCompile, `Running map command ${binaryPath} ${args} in ${cwd}`);

    return new Promise((resolve) => {
        const proc = child_process.spawn(binaryPath, args, { cwd });

        if (onStdOut) proc.stdout.on("data", (o: any) => onStdOut(o.toString()));
        if (onStdErr) proc.stderr.on("data", (o: any) => onStdErr(o.toString()));
        if (onStdErr) proc.on("error", (o: any) => onStdErr(o.toString()));

        proc.on("close", (code: number) => {
            resolve(code === 1);
        });
    });
}
