import os from "node:os";
import { ConfigSystem } from "../systems/CoreConfigSystem.js";
import { Logger } from "../systems/CoreLogSystem.js";
import * as Shared from "mod_companion_shared";
import child_process from "node:child_process";

export function runLauncher(type: Shared.Launchers.Launchers, args?: string) {
    const exe = _getLauncherExe(type);
    if (!exe) {
        console.warn("Unknown launcher type", type);
        return;
    }

    const workingDir = ConfigSystem.getAppConfig().gameRootPath;

    let cmd = exe;

    if (_isWine(exe) && os.platform() === "linux") {
        cmd = `wine ${cmd}`;
    }

    if (!cmd.includes("-game")) {
        cmd += ` -game ${ConfigSystem.getAppConfig().gameName}`;
    }

    if (args) {
        cmd += " " + args;
    }

    Logger.info(Shared.Log.Channel.Generic, `Launching '${cmd}' Working Dir '${workingDir}'`);
    const proc = child_process.spawn(cmd, { cwd: workingDir, shell: true });
    proc.on("error", (message) => {
        Logger.warning(Shared.Log.Channel.Generic, "Launched App: ", message);
    });
}

function _getLauncherExe(launcherType: Shared.Launchers.Launchers): string | undefined {
    const config = ConfigSystem.getAppConfig();
    switch (launcherType) {
        case Shared.Launchers.Launchers.Game:
            return config.gameExePath;
        case Shared.Launchers.Launchers.Hammer:
            return config.hammerPath;
        case Shared.Launchers.Launchers.Hlmv:
            return config.hlmvPath;
        case Shared.Launchers.Launchers.Faceposer:
            return config.faceposerPath;
        default:
            return undefined;
    }
}

function _isWine(binaryPath: string) {
    return binaryPath.includes("win64");
}
