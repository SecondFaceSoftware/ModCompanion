import { app, dialog } from "electron";
import { WindowSystem } from "./systems/MainWindowSystem.js";
import { initApiSystem } from "./systems/MainApiSystem.js";
import * as Core from "mod_companion_core";
import * as Shared from "mod_companion_shared";
import { notifyLogFromMain } from "./api/MainLoggerApi.js";
import { AssetRepositoryApi } from "./api/MainAssetApi.js";
import { notifyAssetGroupsUpdated } from "./api/MainAssetGroupsApi.js";
import { notifyConversionsUpdated } from "./api/MainConversionApi.js";
import { notifyMapCompileLog, notifyMapCompileProgress, notifyMapQueueUpdated } from "./api/MainMapCompileApi.js";
import { FileBrowserApi } from "./api/MainFileBrowserApi.js";
import {
    notifyGameInteropConnected,
    notifyGameInteropDisconnected,
    notifyGameInteropLog,
} from "./api/MainGameInteropApi.js";
import { TaskApi } from "./api/MainTaskApi.js";

type SystemInitFunction = () => Promise<boolean> | boolean;
type SystemShutdownFunction = () => Promise<void> | void;
interface System {
    initFunction: SystemInitFunction;
    shutdownFunction?: SystemShutdownFunction;
    name: string;
}
const systems: System[] = [
    { name: "Log", initFunction: () => Core.Logger.initSystem(notifyLogFromMain) },
    { name: "Config", initFunction: Core.ConfigSystem.initConfigSystem },
    { name: "Api", initFunction: initApiSystem },
    { name: "FileBrowser", initFunction: () => Core.FileBrowserSystem.initSystem(FileBrowserApi.notifyDirUpdated) },
    {
        name: "AssetRepository",
        initFunction: () =>
            Core.AssetRepositorySystem.initSystem({
                scanFunc: (event) => {
                    AssetRepositoryApi.notifyAssetsRescanned(event);
                    Core.MaterialSystem.buildMaterialTextureIndex(event.assets);
                },
            }),
    },
    { name: "Window", initFunction: () => WindowSystem.initSystem(_stopSystems) },
    {
        name: "MapCompile",
        initFunction: () =>
            Core.MapCompileSystem.initSystem({
                queueFunc: notifyMapQueueUpdated,
                logFunc: notifyMapCompileLog,
                progressFunc: notifyMapCompileProgress,
            }),
    },
    {
        name: "AssetWatcher",
        initFunction: () => Core.AssetWatcherSystem.initSystem(AssetRepositoryApi.notifyAssetsUpdated),
    },
    { name: "MareTf", initFunction: Core.MareTfSystem.initSystem },
    { name: "ConversionAgent", initFunction: () => Core.ConversionAgentSystem.initSystem(notifyConversionsUpdated) },
    {
        name: "GameInterop",
        initFunction: () =>
            Core.GameInteropSystem.initSystem({
                connectedFunc: notifyGameInteropConnected,
                disconnectedFunc: notifyGameInteropDisconnected,
                messageFunc: notifyGameInteropLog,
            }),
    },
    { name: "AssetGroups", initFunction: () => Core.AssetGroupsSystem.initSystem(notifyAssetGroupsUpdated) },
    { name: "ArtifactCloud", initFunction: Core.ArtifactCloudSystem.initSystem },
    { name: "HotReload", initFunction: Core.HotReloadSystem.initSystem },
    { name: "Workers", initFunction: Core.WorkerSystem.initSystem, shutdownFunction: Core.WorkerSystem.deinitSystem },
    {
        name: "Tasks",
        initFunction: () =>
            Core.TaskSystem.initSystem({
                startTaskFunc: TaskApi.notifyStartTask,
                updateTaskFunc: TaskApi.notifyUpdateTask,
                endTaskFunc: TaskApi.notifyEndTask,
            }),
    },
    // MC-19 Disabled until the UI for this is built
    // { name: "Materials", initFunction: Core.MaterialSystem.initSystem },
];

async function _startSystems(): Promise<void> {
    Core.Logger.info(Shared.Log.Channel.MainSystems, `Starting Systems...`);

    let success = false;
    const failedSystems: string[] = [];
    let totalStartupTimeMillis = 0;
    for (const system of systems) {
        const timeStart = Date.now();
        const systemResult = system.initFunction();

        success = false;
        try {
            if (typeof systemResult === "boolean") {
                success = systemResult;
            } else if (typeof systemResult === "object") {
                success = await systemResult;
            }
        } catch (e) {
            Core.Logger.error(Shared.Log.Channel.MainSystems, e);
            success = false;
        }
        const timeEnd = Date.now();
        const totalMillis = timeEnd - timeStart;
        totalStartupTimeMillis += totalMillis;

        if (!success) {
            Core.Logger.info(Shared.Log.Channel.MainSystems, `${system.name} System FAIL (${totalMillis}ms)`);
            failedSystems.push(system.name);
            break;
        } else {
            Core.Logger.info(Shared.Log.Channel.MainSystems, `${system.name} System OK (${totalMillis}ms)`);
        }
    }

    if (success) {
        Core.Logger.info(
            Shared.Log.Channel.MainSystems,
            `All systems started successfully! (${totalStartupTimeMillis}ms)`,
        );
    } else {
        await _showStartupFailureWindow(failedSystems);
        app.quit();
    }
}

function _stopSystems() {
    for (const system of systems) {
        if (system.shutdownFunction) {
            Core.Logger.info(Shared.Log.Channel.MainSystems, "Shutting down", system.name, "system");
            system.shutdownFunction();
        }
    }
}

async function _showStartupFailureWindow(failedSystems: string[]) {
    const errorLog = Core.Logger.getErrorLogs()
        .map((l) => Shared.Log.stringifyLog(l, true, true))
        .join("\n");

    return dialog.showMessageBox({
        type: "error",
        title: "Startup Error",
        message: `Failed to start systems: ${failedSystems.join(", ")}`,
        detail: errorLog,
    });
}

function _performPreStartChecks(): boolean {
    const lock = app.requestSingleInstanceLock();
    if (!lock) {
        return false;
    } else {
        app.on("second-instance", () => {
            const mainWindow = WindowSystem.getMainWindow();
            if (mainWindow) {
                if (mainWindow.isMinimized()) mainWindow.restore();
                mainWindow.show();
                mainWindow.maximize();
                mainWindow.focus();
            }
        });
    }

    return true;
}

async function _start() {
    app.setName("Mod Companion");
    if (!_performPreStartChecks()) {
        return;
    }
    Core.Logger.info(Shared.Log.Channel.MainSystems, `Starting Mod Companion`);
    Core.Logger.info(
        Shared.Log.Channel.MainSystems,
        `Development build? ${process.env.NODE_ENV === "development" ? "Yes" : "No"}`,
    );
    Core.Logger.info(Shared.Log.Channel.MainSystems, `Current directory is ${process.cwd()}`);
    Core.Logger.info(Shared.Log.Channel.MainSystems, "App User Data", app.getPath("userData"));

    await Core.AppVersionHelper.determineAppVersion();
    Core.Logger.info(Shared.Log.Channel.MainSystems, `Version is ${Core.AppVersionHelper.getAppVersion()}`);

    await _startSystems();
}

_start();
