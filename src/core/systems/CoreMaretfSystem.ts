import os from "node:os";
import fs from "node:fs";
import * as pathe from "pathe";
import * as child_process from "node:child_process";
import { getMainAssetsDir } from "../helpers/CoreFilesystem.js";
import { runConverter } from "../helpers/converter/CoreSharedConverter.js";
import { ConfigSystem } from "./CoreConfigSystem.js";
import { Logger } from "./CoreLogSystem.js";
import * as Shared from "mod_companion_shared";
import { createVtfInfo, SharedVtfInfo, SharedVtfInfoRawOutput } from "mod_companion_shared/SharedVtf.js";
import * as sourcelib from "sourcelib";
import { runProcess } from "../helpers/CoreRunProcess.js";

let binary = "";

export const MareTfSystem = {
    initSystem(): boolean {
        if (os.type().toLowerCase() === "linux") {
            binary = pathe.join(getMainAssetsDir(), "lib", "maretf");

            child_process.spawn(`chmod +x ${binary}`, { shell: true });
            return true;
        }
        if (os.type().toLowerCase() === "windows_nt") {
            binary = pathe.join(getMainAssetsDir(), "lib", "maretf.exe");
            return true;
        }

        Logger.warning(Shared.Log.Channel.MareTF, "Cannot determine binary for maretf");
        return false;
    },
    getMareTfBinaryPath(): string {
        return binary;
    },
    async createVtf(
        inputPath: string,
        outputPath: string,
        options: Shared.Vtf.SharedVtfCreateOptions = {},
    ): Promise<string> {
        const cmd = _buildMateTfCreateCommand(inputPath, outputPath, options);

        try {
            const dir = pathe.dirname(outputPath);
            fs.mkdirSync(dir, { recursive: true });
        } catch (e) {
            // Nobody cares if the dir already exists
        }

        return runConverter(cmd, ConfigSystem.getAppConfig().gamePath, "MareTF");
    },
    async getVtfInfo(inputPath: Shared.Paths.Path): Promise<SharedVtfInfo> {
        const absFilePath = Shared.Paths.transformPathBase(
            inputPath,
            Shared.Paths.PathBases.Absolute,
            ConfigSystem.getAppConfig(),
        );
        if (!absFilePath) {
            throw new Error(`VTF File path didn't resolve ${inputPath}`);
        }

        const infoText = await _runMaretfInfo(absFilePath.path);
        if (!infoText) {
            throw new Error("Failed to get vtf info. Maretf returned no text");
        }

        // maretf outputs multiple root nodes and it's easier to parse this way.
        // should probably have sourcelib output this better
        const fullKv = `"info"{\n${infoText}\n}`;
        const parsed = sourcelib.kv.KvSerializer.deserializeText(fullKv);
        if (parsed.length === 0) {
            throw new Error("Failed to parse vtf info output");
        }
        const raw = parsed[0] as unknown as SharedVtfInfoRawOutput;
        return createVtfInfo(raw);
    },
    async getVtfExtract(inputPath: Shared.Paths.Path): Promise<string> {
        const absFilePath = Shared.Paths.transformPathBase(
            inputPath,
            Shared.Paths.PathBases.Absolute,
            ConfigSystem.getAppConfig(),
        );
        if (!absFilePath) {
            throw new Error(`VTF File path didn't resolve ${inputPath}`);
        }

        return _runMaretfExtract(absFilePath.path);
    },
};

function _runMaretfInfo(inputPath: string): Promise<string> {
    const cmd = `${binary} info --verbose --info-output-mode=kv1 ${inputPath}`;
    return runProcess(cmd, "MareTF Info");
}

function _runMaretfExtract(inputPath: string): Promise<string> {
    const cmd = `${binary} extract --extract-stdout ${inputPath}`;
    return runProcess(cmd, "MareTF Extract");
}

function _buildMateTfCreateCommand(
    inputPath: string,
    outputPath: string,
    options: Shared.Vtf.SharedVtfCreateOptions,
): string {
    const args = Shared.Vtf.buildMareTfCreateArgs(options);
    const cmd = `${binary} -y create ${inputPath} -o ${outputPath} ${args}`;
    return cmd;
}
