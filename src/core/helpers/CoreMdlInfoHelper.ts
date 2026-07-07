import child_process from "node:child_process";
import * as sourcelib from "sourcelib";
import * as Shared from "mod_companion_shared";
import { ConfigSystem } from "../systems/CoreConfigSystem.js";

export const MdlInfoHelper = {
    async run(mdlFilePath: string): Promise<Shared.MdlInfo.SharedMdlInfoReport> {
        return new Promise((resolve, reject) => {
            const cfg = ConfigSystem.getAppConfig();
            const cmd = `${cfg.mdlInfoPath} -game ${cfg.gamePath} ${mdlFilePath}`;

            const output: string[] = [];

            const proc = child_process.spawn(cmd, { shell: true });

            proc.stdout.on("data", (d) => output.push(d.toString()));

            proc.on("exit", (code: number) => {
                if (code === 0) {
                    const kvFile = output.join("\n");
                    const result = sourcelib.kv.KvSerializer.deserializeText(kvFile, { detectArrays: true });
                    if (result.length !== 1) {
                        reject();
                    }

                    resolve(result[0] as unknown as Shared.MdlInfo.SharedMdlInfoReport);
                }
            });
        });
    },
};
