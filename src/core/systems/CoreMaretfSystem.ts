import os from "node:os";
import fs from "node:fs";
import path from "node:path";
import * as child_process from "node:child_process";
import { getMainAssetsDir } from "../helpers/CoreFilesystem.js";
import { runConverter } from "../helpers/converter/CoreSharedConverter.js";
import { ConfigSystem } from "./CoreConfigSystem.js";
import { Logger } from "./CoreLogSystem.js";
import * as Shared from "mod_companion_shared";
import { createVtfInfo, SharedVtfInfo, SharedVtfInfoRawOutput } from "mod_companion_shared/SharedVtf.js";
import * as sourcelib from "sourcelib";

let binary = "";

export const MareTfSystem = {
    initSystem(): boolean {
        if (os.type().toLowerCase() === "linux") {
            binary = path.join(getMainAssetsDir(), "lib", "maretf");

            child_process.spawnSync(`chmod +x ${binary}`, { shell: true });
            return true;
        }
        if (os.type().toLowerCase() === "windows_nt") {
            binary = path.join(getMainAssetsDir(), "lib", "maretf.exe");
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
            const dir = path.dirname(outputPath);
            fs.mkdirSync(dir, { recursive: true });
        } catch (e) {
            // Nobody cares if the dir already exists
        }

        return runConverter(cmd, ConfigSystem.getAppConfig().gamePath, "MareTF");
    },
    async getVtfInfo(inputPath: string): Promise<SharedVtfInfo> {
        const infoText = await _runMaretfInfo(inputPath);

        if (!infoText) {
            throw new Error("Failed to get vtf info");
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
};

function _runMaretfInfo(inputPath: string): Promise<string> {
    const cmd = `${binary} info --verbose --info-output-mode=kv1 ${inputPath}`;
    return new Promise<string>((resolve, reject) => {
        try {
            const data: string[] = [];
            // console.log(cmd);
            const proc = child_process.exec(
                cmd,
                { cwd: ConfigSystem.getAppConfig().gamePath },
                (error, stdout, stderr) => {
                    if (stdout) {
                        data.push(stdout.toString());
                    } else if (error) {
                        reject("MareTF failed: " + error.message);
                    } else if (stderr) {
                        reject("MareTF failed: " + stderr);
                    }
                },
            );
            if (proc.pid !== undefined) {
                os.setPriority(proc.pid, os.constants.priority.PRIORITY_LOW);
            }
            proc.on("exit", (code) => {
                if (code === 0) {
                    resolve(data.join("\n"));
                } else {
                    reject();
                }
            });
            proc.on("error", (e) => {
                reject(e);
            });
        } catch (e) {
            if (typeof e === "string") {
                reject(e);
            } else {
                reject("MareTF info exited with unknown error");
            }
        }
    });
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
