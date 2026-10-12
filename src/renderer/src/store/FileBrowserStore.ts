import { defineStore } from "pinia";
import * as Shared from "mod_companion_shared";
import { usePanelsStore } from "~/store/PanelsStore.js";
import { GlobalComponentNames } from "~/helper/GlobalComponents.js";
import { FileBrowserModel } from "~/components/panels/fileBrowser/FileBrowser.model.js";

export const useFileBrowserStore = defineStore("file-browser", () => {
    const panelsStore = usePanelsStore();

    const fsEntries = reactive(new Map<string, Shared.FileBrowser.FileEntries>());

    async function refreshDir(dirName: string) {
        const report = await window.electronAPI.fileBrowser.listFiles(dirName);
        fsEntries.set(dirName, report);
    }

    function updateOpenedDirs(): void {
        const panels = panelsStore.getPanels(GlobalComponentNames.FileBrowser);
        if (!panels) return;

        const currentDirs: string[] = [];
        for (const panel of panels) {
            const model = panelsStore.getModel<FileBrowserModel>(panel.id);
            if (model?.currentDir) {
                currentDirs.push(model.currentDir);
            }
        }

        window.electronAPI.fileBrowser.updateOpenedDirs(currentDirs);
    }

    async function createFile(path: Shared.Paths.Path, data: string): Promise<void> {
        await window.electronAPI.file.writeString(path, data);
    }

    panelsStore.modelsInitializedEvent.on(() => {
        updateOpenedDirs();
    });

    window.electronAPI.fileBrowser.subscribeDirUpdated((dir, entries) => {
        fsEntries.set(dir, entries);
    });

    window.electronAPI.fileBrowser.subscribeIndexUpdated((index) => {
        fsEntries.clear();
        for (const [key, entries] of index.entries()) {
            fsEntries.set(key, entries);
        }
    });

    return {
        fsEntries,
        refreshDir,
        updateOpenedDirs,
        createFile,
    };
});
