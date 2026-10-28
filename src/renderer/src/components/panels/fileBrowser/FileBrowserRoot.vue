<template>
    <MPanelRoot no-scroll>
        <template #header>
            <div class="grid gap-1 grid-cols-[minmax(0,1fr)_minmax(4rem,30%)]">
                <div class="flex gap-1">
                    <UFieldGroup>
                        <UButton
                            :icon="AppDesign.Icons.ChevronLeft"
                            :disabled="historyIdx <= 0"
                            @click="goHistoryBack"
                        />
                        <UButton
                            :icon="AppDesign.Icons.ChevronRight"
                            :disabled="historyIdx >= history.length - 1"
                            @click="goHistoryForward"
                        />
                    </UFieldGroup>
                    <UButton :icon="AppDesign.Icons.ActionRefresh" @click="refresh" />
                    <FileBrowserLocationBar
                        v-model="currentDir"
                        @clear-search="clearSearchTerm"
                        @focus-list="handleFocusList"
                    />
                </div>
                <FileBrowserSearchBar v-model="searchTerm" />
            </div>
        </template>
        <UContextMenu :items="items">
            <MDataTable
                ref="dataTable"
                :row-height="20"
                :columns="columns"
                :entries="entries"
                :draggable="true"
                no-scroll
                no-header
                @on-entry-activated="handleActivated"
                @on-selection-changed="handleSelectionChanged"
                @on-active-changed="handleActiveChanged"
                @on-drag-start="handleDragStart"
            />
        </UContextMenu>
    </MPanelRoot>
</template>

<script setup lang="ts">
import * as pathe from "pathe";
import { watchImmediate } from "@vueuse/core";
import * as Shared from "mod_companion_shared";
import FileBrowserLocationBar from "~/components/panels/fileBrowser/FileBrowserLocationBar.vue";
import { useFileBrowserStore } from "~/store/FileBrowserStore.js";
import { DataTableColumn } from "~/components/common/dataTable/MDataTable.model.js";
import FileBrowserEntryIcon from "~/components/panels/fileBrowser/FileBrowserEntryIcon.vue";
import { ContextMenuItem } from "@nuxt/ui/components/ContextMenu.vue.js";
import { useAssetListStore } from "~/store/AssetListStore.js";
import { AppDesign } from "~/design/AppDesign.js";
import { useAssetGroupsStore } from "~/store/AssetGroupsStore.js";
import { getAppConfig } from "~/renderer-config.js";
import FileBrowserSearchBar from "~/components/panels/fileBrowser/FileBrowserSearchBar.vue";
import FileBrowserEntryName from "~/components/panels/fileBrowser/FileBrowserEntryName.vue";
import { useFileFilter } from "~/composables/useFilter.js";
import { getRootRelativePath } from "~/helper/SourceFs.js";
import { Logger } from "~/logger.js";
import { GlobalComponentNames } from "~/helper/GlobalComponents.js";
import { usePanelsStore } from "~/store/PanelsStore.js";
import { FileInspectorModel } from "~/components/panels/fileInspector/FileInspector.model.js";
import { FileBrowserBehavior } from "~/components/panels/fileBrowser/FileBrowser.model.js";
import FileBrowserEntrySize from "~/components/panels/fileBrowser/FileBrowserEntrySize.vue";
import { MaterialHelper } from "~/helper/MaterialHelper.js";
import { ClipboardHelper } from "~/helper/ClipboardHelper.js";

const fileBrowserStore = useFileBrowserStore();
const assetListStore = useAssetListStore();
const assetGroupsStore = useAssetGroupsStore();
const panelsStore = usePanelsStore();

const searchTerm = defineModel<string>("search");
const currentDir = defineModel<string>("dir");

watch(
    () => fileBrowserStore.fsEntries,
    (value, oldValue) => {
        console.log(value, oldValue);
    },
);

const searchEntries = computed(() => {
    console.log(fileBrowserStore.fsEntries);
    return useFileFilter(fileBrowserStore.fsEntries, searchTerm.value, 1000);
});
const entries = computed<Shared.FileBrowser.FileEntry[]>(() => {
    let result;
    if (searchTerm.value) {
        result = searchEntries.value;
    } else {
        if (!currentDir.value) return [];
        const e = fileBrowserStore.fsEntries.get(currentDir.value);
        if (!e) {
            return [];
        } else {
            result = e;
        }
    }

    console.log(result);

    return Shared.FileBrowser.sortFileEntries(result);
});

const activeEntry = ref<Shared.FileBrowser.FileEntry | undefined>(undefined);

const history = reactive<string[]>([currentDir.value || "/"]); // || is intentional because we also want to turn empty string into "/"
const historyIdx = ref<number>(0);
const suppressHistoryPush = ref(false);

watch(
    currentDir,
    (d) => {
        let dir = d ?? "";
        if (dir && Shared.SourceFs.isProjectPath(dir, getAppConfig().rootPath)) {
            currentDir.value = dir = Shared.SourceFs.correctProjectPath(dir, getAppConfig().rootPath) ?? "";
        }

        // Correct empty or undefined paths to be /
        if (!dir) {
            currentDir.value = dir = "/";
        } else if (dir.length > 1 && dir.startsWith("/")) {
            currentDir.value = dir.substring(1);
        } else {
            // And as for the correct paths, remember them in the history

            if (suppressHistoryPush.value) {
                suppressHistoryPush.value = false;
            } else {
                // Destroy the future history just like back to the future 2 taught us
                if (historyIdx.value !== history.length - 1) {
                    history.splice(historyIdx.value + 1);
                }

                // Don't add duplicates
                const alreadyAtLast = history[history.length - 1] === dir;
                if (!alreadyAtLast) {
                    history.push(dir);
                    historyIdx.value = history.length - 1;
                }
            }
        }

        fileBrowserStore.refreshDir(dir);
        fileBrowserStore.updateOpenedDirs();
    },
    { immediate: true },
);

const selectedEntries = ref<Shared.FileBrowser.FileEntry[]>([]);

watch(entries, () => {
    dataTable.value?.deselect();
});

function refresh(): void {
    const dir = currentDir.value;
    if (dir !== undefined) {
        fileBrowserStore.refreshDir(dir);
    }
}

function goHistoryBack(): void {
    if (history.length <= 1) return;
    if (historyIdx.value > 0) {
        historyIdx.value--;
    }

    suppressHistoryPush.value = true;
    currentDir.value = history[historyIdx.value];
}

function goHistoryForward(): void {
    if (history.length <= 1) return;
    if (historyIdx.value < history.length) {
        historyIdx.value++;
    }

    suppressHistoryPush.value = true;
    currentDir.value = history[historyIdx.value];
}

const shortcuts = inject(FileBrowserBehavior.ShortcutsInjectKey);
if (shortcuts) {
    watchImmediate(shortcuts, (s) => {
        s.onBack.on(goHistoryBack);
        s.onForward.on(goHistoryForward);
        s.onRefresh.on(refresh);
        s.onDelete.on(handleDeleteShortcut);
    });
}

const dataTable = useTemplateRef("dataTable");

const columns: DataTableColumn<Shared.FileBrowser.FileEntry>[] = [
    {
        id: "icon",
        size: "auto",
        label: "",
        cell: (entry) => h(FileBrowserEntryIcon, { entry: entry }),
    },
    {
        id: "name",
        size: "minmax(0,1fr)",
        label: "Name",
        cell: (entry) => h(FileBrowserEntryName, { name: entry.name }),
    },
    {
        id: "size",
        size: "auto",
        label: "Size",
        cell: (entry) => h(FileBrowserEntrySize, { size: entry.fileSize }),
    },
];

const items = computed<ContextMenuItem[][]>(() => {
    const entries = selectedEntries.value;
    const dir = currentDir.value;
    if (entries.length === 0 && dir) {
        return [
            [
                {
                    label: "New Empty Asset",
                    icon: AppDesign.Icons.ActionAdd,
                    onSelect() {
                        window.electronAPI.asset.createEmpty(dir);
                    },
                },
            ],
        ] satisfies ContextMenuItem[][];
    }

    const allFiles = !entries.some((e) => !e.isFile);
    const pathsStringArray = entries.map((e) => e.path);
    const pathsArray = pathsStringArray.map((p) => Shared.Paths.createPath(p, Shared.Paths.PathBases.Root));
    const allVextures = !entries.some((e) => !e.isFile || pathe.extname(e.name) !== ".vtf");
    const autoMaterial = allVextures ? Shared.Vmt.createAutoMaterial(pathsArray, getAppConfig()) : undefined;

    return [
        [
            {
                label: "Open",
                icon: AppDesign.Icons.ActionLaunchFile,
                disabled: !allFiles,
                onSelect() {
                    window.electronAPI.fileBrowser.open(pathsArray);
                },
            },
            {
                label: "Explore to",
                icon: AppDesign.Icons.ActionBrowseToFolder,
                disabled: entries.length !== 1,
                onSelect() {
                    window.electronAPI.fileBrowser.browseTo(
                        Shared.Paths.createPath(entries[0].path, Shared.Paths.PathBases.Root),
                    );
                },
            },
        ],
        [
            {
                label: "Create individual Assets",
                icon: AppDesign.Icons.ActionCreateAsset,
                disabled: !allFiles,
                onSelect() {
                    const primaryPath = activeEntry.value?.path ?? pathsStringArray[0];
                    const otherPaths = pathsStringArray.toSpliced(pathsStringArray.indexOf(primaryPath), 1);
                    assetListStore.createAsset(primaryPath, otherPaths);
                },
            },
            {
                label: "Create grouped Asset",
                icon: AppDesign.Icons.ActionCreateAsset,
                disabled: !allFiles,
                onSelect() {
                    const primaryPath = activeEntry.value?.path ?? pathsStringArray[0];
                    const otherPaths = pathsStringArray.toSpliced(pathsStringArray.indexOf(primaryPath), 1);
                    assetListStore
                        .createAsset(primaryPath, otherPaths)
                        .then((assets) => assetGroupsStore.createGroup(assets.map((s) => s.def.id)));
                },
            },
            {
                label: "Create Material",
                icon: AppDesign.Icons.ActionCreateAsset,
                disabled: !autoMaterial,
                onSelect(e: Event) {
                    MaterialHelper.createMaterial(autoMaterial!).then(refresh);
                },
            },
        ],
        [
            {
                label: "Copy relative path",
                icon: AppDesign.Icons.Copy,
                disabled: entries.length !== 1,
                onSelect() {
                    ClipboardHelper.writeTextAndToast(entries[0].path);
                },
            },
            {
                label: "Copy full path",
                icon: AppDesign.Icons.Copy,
                disabled: entries.length !== 1,
                onSelect() {
                    const fullPath = pathe.join(getAppConfig().rootPath, entries[0].path);
                    ClipboardHelper.writeTextAndToast(fullPath);
                },
            },
        ],
        [
            {
                label: "Delete",
                icon: AppDesign.Icons.ActionDelete,
                onSelect() {
                    deleteFiles(entries.map((e) => e.path));
                },
            },
        ],
    ] satisfies ContextMenuItem[][];
});

function handleDeleteShortcut(): void {
    deleteFiles(selectedEntries.value.filter((e) => e.isFile).map((e) => e.path));
}

async function deleteFiles(files: Iterable<string>): Promise<void> {
    const promises: Promise<boolean>[] = [];
    for (const sel of files) {
        promises.push(window.electronAPI.file.delete(Shared.Paths.createPath(sel, Shared.Paths.PathBases.Root)));
    }
    await Promise.allSettled(promises);
    refresh();
}

function handleFocusList(): void {
    dataTable.value?.focus();
}

function handleActivated(entry: Shared.FileBrowser.FileEntry, event?: KeyboardEvent | MouseEvent): void {
    if (!entry.isFile) {
        setCurrentDir(entry.path);
        return;
    }

    if (event?.shiftKey) {
        window.electronAPI.fileBrowser.open(Shared.Paths.createPath(entry.path, Shared.Paths.PathBases.Root));
    } else {
        panelsStore.openInspector<FileInspectorModel>(
            GlobalComponentNames.FileInspector,
            { file: entry.path },
            "right",
            (i) => panelsStore.getModel<FileInspectorModel>(i.params?.panelId)?.file === entry.path,
        );
    }
}

function handleSelectionChanged(entries: Shared.FileBrowser.FileEntry[]): void {
    selectedEntries.value = entries;
}

function handleActiveChanged(entry: Shared.FileBrowser.FileEntry | undefined): void {
    activeEntry.value = entry;
    if (entry?.isFile) {
        panelsStore.spawnTemporaryPanel<FileInspectorModel>(GlobalComponentNames.FileInspector, { file: entry.path });
    }
}

function handleDragStart(
    event: DragEvent,
    primaryEntry: Shared.FileBrowser.FileEntry,
    allEntries: Shared.FileBrowser.FileEntry[],
): void {
    const payload = allEntries.map((e) => e.path).join("\n");
    event.dataTransfer?.setData("text/plain", payload);
}

function setCurrentDir(dir: string): void {
    let correctedPath = getRootRelativePath(dir);
    if (correctedPath === undefined) {
        Logger.warning(Shared.Log.Channel.Generic, `Cannot update path to ${dir} because it's invalid`);
        return;
    }

    if (correctedPath.startsWith("/")) {
        correctedPath = correctedPath.substring(1);
    }
    if (pathe.extname(correctedPath) !== "") {
        correctedPath = pathe.dirname(correctedPath);
    }

    currentDir.value = correctedPath;
    clearSearchTerm();
}

function clearSearchTerm() {
    searchTerm.value = "";
}
</script>

<style scoped></style>
