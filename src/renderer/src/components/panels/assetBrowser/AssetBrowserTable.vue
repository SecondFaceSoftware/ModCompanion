<template>
    <UContextMenu :items="items">
        <MDataTable
            ref="table"
            :row-height="20"
            :entries="entries"
            :columns="columns"
            :tree-child-func="treeChildFunc"
            draggable
            no-scroll
            neutral-highlight
            @on-active-changed="handleActiveChanged"
            @on-selection-changed="handleSelectionChanged"
            @on-drag-start="handleDragStart"
            @on-entry-activated="handleEntryActivated"
            @on-key-down="handleKeyDown"
        />
    </UContextMenu>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useAssetListStore } from "~/store/AssetListStore.js";
import { DataTableColumn } from "~/components/common/dataTable/MDataTable.model.js";
import { useAssetConversionStore } from "~/store/AssetConversionStore.js";
import { ContextMenuItem } from "@nuxt/ui/components/ContextMenu.vue.js";
import { exploreToMca, openAssociatedFile, openMca } from "~/helper/AssetHelper.js";
import AssetBrowserCellAssetName from "~/components/panels/assetBrowser/AssetBrowserCellAssetName.vue";
import AssetBrowserCellConverted from "~/components/panels/assetBrowser/AssetBrowserCellConverted.vue";
import { useAssetGroupsStore } from "~/store/AssetGroupsStore.js";
import {
    AssetBrowserAssetEntry,
    AssetBrowserEntry,
    AssetBrowserEntryTypes,
    AssetBrowserModel,
    getAssetBrowserEntrySortString,
    isAssetBrowserAssetEntry,
    isAssetBrowserGroupEntry,
} from "~/components/panels/assetBrowser/AssetBrowser.model.js";
import AssetBrowserCellGroupName from "~/components/panels/assetBrowser/AssetBrowserCellGroupName.vue";
import ClipboardHelper from "~/helper/ClipboardHelper.js";
import { summarizeConversionStates } from "~/helper/ConversionHelper.js";
import { AppDesign } from "~/design/AppDesign.js";
import * as Shared from "mod_companion_shared";
import { useAssetsFilter } from "~/composables/useFilter.js";
import { usePanelsStore } from "~/store/PanelsStore.js";
import { GlobalComponentNames } from "~/helper/GlobalComponents.js";
import { AssetInspectorModel } from "~/components/panels/assetInspector/AssetInspector.model.js";
import { FileInspectorModel } from "~/components/panels/fileInspector/FileInspector.model.js";

const listStore = useAssetListStore();
const conversionStore = useAssetConversionStore();
const assetGroupsStore = useAssetGroupsStore();
const panelsStore = usePanelsStore();

const table = useTemplateRef("table");

const model = defineModel<AssetBrowserModel>({ required: true });

const filteredEntries = computed(() =>
    useAssetsFilter(listStore.assets.values(), model.value.searchTerm, model.value.typeFilter),
);

const activeId = ref<Shared.Asset.AssetId | undefined>();
const selectedIds = ref<Shared.Asset.AssetId[]>([]);
const selectedAssets = computed(() =>
    filteredEntries.value.filter((value: Shared.Asset.Asset) => selectedIds.value.includes(value.def.id)),
);

const expandedState = ref<Shared.AssetGroup.GroupId[]>([]);
const activeGroupId = ref<Shared.AssetGroup.GroupId | undefined>();
const activeGroup = computed(() => {
    const v = activeGroupId.value;
    if (!v) {
        return undefined;
    } else {
        return assetGroupsStore.groups.get(v);
    }
});

listStore.activateEvent.on((assetId) => {
    if (assetId === undefined) {
        table.value?.deactivate();
    } else {
        const group = assetGroupsStore.getGroupFromAssetId(assetId);
        if (group) {
            expand(group.id);
        }
        table.value?.activate((entry) => isAssetBrowserAssetEntry(entry) && entry.assetDef.id === assetId);
    }
});

listStore.selectEvent.on((assetIds) => {
    if (assetIds.length === 0) {
        table.value?.deselect();
    } else {
        for (const assetId of assetIds) {
            const group = assetGroupsStore.getGroupFromAssetId(assetId);
            if (group) {
                expand(group.id);
            }
        }
        table.value?.select((entry) => isAssetBrowserAssetEntry(entry) && assetIds.includes(entry.assetDef.id));
    }
});

const entries = computed(() => {
    const assetGroups = assetGroupsStore.groups;
    const assetIdsInGroups: Shared.Asset.AssetId[] = [];

    // Add groups first
    const result: AssetBrowserEntry[] = [];
    for (const assetGroup of assetGroups.values()) {
        const searchTerm = model.value.searchTerm;
        if (searchTerm) {
            const passesSearch = assetGroup.def.displayName.includes(searchTerm);
            if (!passesSearch) {
                continue;
            }
        }

        result.push({
            type: AssetBrowserEntryTypes.Group,
            group: assetGroup,
        });

        assetIdsInGroups.push(...assetGroup.def.assets);
    }

    // Add remaining ungrouped asset
    for (const assets of filteredEntries.value) {
        if (assetIdsInGroups.includes(assets.def.id)) {
            continue;
        }

        result.push({
            type: AssetBrowserEntryTypes.Asset,
            assetDef: assets.def,
        });
    }

    result.sort((a, b) => getAssetBrowserEntrySortString(a).localeCompare(getAssetBrowserEntrySortString(b)));

    return result;
});

function treeChildFunc(entry: AssetBrowserEntry): AssetBrowserEntry[] | undefined {
    if (isAssetBrowserGroupEntry(entry)) {
        if (!isExpanded(entry.group.id)) return undefined;

        const assets = listStore.getAssetsById(entry.group.def.assets);
        const entries = assets.map<AssetBrowserAssetEntry>((a) => ({
            type: AssetBrowserEntryTypes.Asset,
            assetDef: a.def,
        }));
        return entries;
    }

    return undefined;
}

const editingGroup = ref<Shared.AssetGroup.GroupId | undefined>();
const editingAsset = ref<Shared.AssetGroup.GroupId | undefined>();

function stopEditing() {
    editingAsset.value = undefined;
    editingGroup.value = undefined;
    nextTick(() => {
        table.value?.focus();
    });
}

const columns: DataTableColumn<AssetBrowserEntry>[] = [
    {
        id: "name",
        label: "Name",
        size: "minmax(0, 1fr)",
        cell: (entry, depth) => {
            if (isAssetBrowserAssetEntry(entry)) {
                return h(AssetBrowserCellAssetName, {
                    id: entry.assetDef.id,
                    name: entry.assetDef.displayName ?? "(unknown)",
                    type: entry.assetDef.type,
                    depth,
                    editing: editingAsset.value === entry.assetDef.id,
                    onStopEditing: stopEditing,
                });
            } else if (isAssetBrowserGroupEntry(entry)) {
                return h(AssetBrowserCellGroupName, {
                    name: entry.group.def.displayName,
                    id: entry.group.id,
                    editing: editingGroup.value === entry.group.id,
                    isExpanded: isExpanded(entry.group.id),
                    onStopEditing: stopEditing,
                    onToggleCollapsed: () => toggleCollapsed(entry.group.id),
                });
            }

            return undefined;
        },
    },
    {
        id: "converted",
        label: "Conv",
        size: "auto",
        cell: (entry) => {
            if (isAssetBrowserAssetEntry(entry)) {
                const state = conversionStore.getState(entry.assetDef.id);
                return h(AssetBrowserCellConverted, { state });
            }

            if (isAssetBrowserGroupEntry(entry)) {
                const state = summarizeConversionStates(entry.group.def.assets.map(conversionStore.getState));
                return h(AssetBrowserCellConverted, { state });
            }
        },
    },
];

function handleSelectionChanged(entries: AssetBrowserEntry[]): void {
    selectedIds.value = entries.filter(isAssetBrowserAssetEntry).map((a) => a.assetDef.id);
}

function handleActiveChanged(entry: AssetBrowserEntry | undefined): void {
    if (isAssetBrowserAssetEntry(entry)) {
        activeId.value = entry.assetDef.id;
        activateGroup(undefined);

        panelsStore.spawnTemporaryPanel<AssetInspectorModel>(
            GlobalComponentNames.AssetInspector,
            {
                assetId: entry.assetDef.id,
            },
            "right",
        );
    } else if (isAssetBrowserGroupEntry(entry)) {
        activateGroup(entry.group.id);
        activeId.value = undefined;
    }
}

const items = computed(() => {
    const options: ContextMenuItem[][] = [];

    {
        const group = activeGroup.value;
        if (group) {
            options.push([
                {
                    label: "Convert",
                    onSelect() {
                        for (const id of group.def.assets) {
                            conversionStore.enqueue(id);
                        }
                    },
                    icon: AppDesign.Icons.ActionConvertAsset,
                    color: "success",
                },
                {
                    label: "Delete Group",
                    onSelect(e: Event) {
                        assetGroupsStore.deleteGroup(group.id);
                    },
                    icon: AppDesign.Icons.ActionDelete,
                    color: "error",
                },
                {
                    label: "Copy Name",
                    icon: "empty",
                    onSelect() {
                        ClipboardHelper.writeTextAndToast(group.def.displayName!);
                    },
                    disabled: group.def.displayName == undefined,
                },
            ]);
        }
    }

    {
        const selAssets = selectedAssets.value;
        if (selAssets.length > 0) {
            const isAnyGrouped = selAssets.some((selected: Shared.Asset.Asset) =>
                assetGroupsStore.isGrouped(selected.def.id),
            );
            const isAllGrouped = selAssets.every((selected: Shared.Asset.Asset) =>
                assetGroupsStore.isGrouped(selected.def.id),
            );
            options.push([
                {
                    label: "Convert",
                    onSelect() {
                        for (const sel of selAssets) {
                            conversionStore.enqueue(sel.def.id);
                        }
                    },
                    icon: AppDesign.Icons.ActionConvertAsset,
                    color: "success",
                },
                {
                    label: "Create Asset Group",
                    onSelect() {
                        assetGroupsStore.createGroup(selAssets.map((s: Shared.Asset.Asset) => s.def.id));
                        table.value?.deselect();
                    },
                    icon: AppDesign.Icons.ActionCreateAssetGroup,
                    color: isAnyGrouped ? "neutral" : "success",
                    disabled: isAnyGrouped,
                },
            ]);

            if (selAssets.length === 1) {
                const sel = selAssets[0];

                if (sel.def.associatedFiles) {
                    const ass = sel.def.associatedFiles;
                    for (const assKey in ass) {
                        const key = assKey as keyof Shared.Asset.AssociatedFiles;
                        const v = ass[key];
                        if (v) {
                            const entry = Shared.Asset.getAssociatedEntryName(key)!;
                            options.push([
                                {
                                    label: `Open ${entry.name}`,
                                    color: "info",
                                    onSelect() {
                                        openAssociatedFile(v);
                                    },
                                    icon: entry.icon,
                                },
                            ]);
                        }
                    }
                }

                options.push([
                    {
                        label: "Open .mca",
                        onSelect() {
                            openMca(sel);
                        },
                        icon: AppDesign.Icons.ActionOpenFileMca,
                    },
                    {
                        label: "Explore to .mca",
                        onSelect() {
                            exploreToMca(sel);
                        },
                        icon: AppDesign.Icons.ActionExploreToMca,
                    },
                    {
                        label: "Copy Name",
                        icon: "empty",
                        onSelect() {
                            ClipboardHelper.writeTextAndToast(sel.def.displayName!);
                        },
                        disabled: sel.def.displayName == undefined,
                    },
                    {
                        label: "Copy ID",
                        icon: "empty",
                        onSelect() {
                            ClipboardHelper.writeTextAndToast(sel.def.id);
                        },
                        disabled: sel.def.displayName == undefined,
                    },
                    {
                        label: "Remove from group",
                        icon: AppDesign.Icons.ActionRemove,
                        onSelect() {
                            assetGroupsStore.writeRemoveAssetsFromTheirGroups(selAssets.map((a) => a.def.id));
                        },
                        disabled: !isAllGrouped,
                    },
                ]);
            }
        }
    }

    return options;
});

function handleDragStart(event: DragEvent, primaryEntry: AssetBrowserEntry, allEntries: AssetBrowserEntry[]): void {
    const payloads: string[] = [];

    for (const entry of allEntries) {
        if (isAssetBrowserAssetEntry(entry)) {
            payloads.push(`asset;${entry.assetDef.id}`);
        } else {
            payloads.push(`group;${entry.group.id}`);
        }
    }

    const payload = payloads.join("\n");
    event.dataTransfer?.setData("text/plain", payload);
}

function handleEntryActivated(entry: AssetBrowserEntry): void {
    if (isAssetBrowserGroupEntry(entry)) {
        toggleCollapsed(entry.group.id);
    } else {
        panelsStore.openInspector(
            GlobalComponentNames.AssetInspector,
            (i) => panelsStore.getModel<AssetInspectorModel>(i.params?.panelId)?.assetId === entry.assetDef.id,
        );
    }
}

function handleKeyDown(event: KeyboardEvent, entry: AssetBrowserEntry | undefined): void {
    // Copy
    if (event.ctrlKey && event.key === "c") {
        let name: string | undefined = undefined;

        if (isAssetBrowserAssetEntry(entry)) {
            name = entry.assetDef.displayName;
        }
        if (isAssetBrowserGroupEntry(entry)) {
            name = entry.group.def.displayName;
        }

        if (name) {
            ClipboardHelper.writeTextAndToast(name);
        }

        event.preventDefault();
    }

    if (event.key === "F2") {
        if (isAssetBrowserAssetEntry(entry)) {
            editingAsset.value = entry.assetDef.id;
        }
        if (isAssetBrowserGroupEntry(entry)) {
            editingGroup.value = entry.group.id;
        }
    }
}

// groups

function activateGroup(id: Shared.AssetGroup.GroupId | undefined): void {
    activeGroupId.value = id;
}

function isExpanded(groupId: Shared.AssetGroup.GroupId) {
    return expandedState.value.includes(groupId);
}

function isCollapsedAsset(assetId: Shared.Asset.AssetId) {
    const id = assetGroupsStore.getGroupFromAssetId(assetId)?.id;
    if (id === undefined) return false;
    return !isExpanded(id);
}

function collapse(assetId: Shared.AssetGroup.GroupId) {
    const idx = expandedState.value.indexOf(assetId);
    if (idx >= 0) {
        const newState = [...expandedState.value];
        newState.splice(idx, 1);
        expandedState.value = newState;
    }
}

function expand(assetId: Shared.AssetGroup.GroupId) {
    if (!isExpanded(assetId)) {
        const newState = [...expandedState.value];
        newState.push(assetId);
        expandedState.value = newState;
    }
}

function toggleCollapsed(assetId: Shared.AssetGroup.GroupId) {
    const newState = [...expandedState.value];
    const idx = newState.indexOf(assetId);
    if (idx >= 0) {
        newState.splice(idx, 1);
    } else {
        newState.push(assetId);
    }
    expandedState.value = newState;
}

function collapseAll() {
    expandedState.value = [];
}

function expandAll() {
    expandedState.value = Array.from(assetGroupsStore.groups.keys());
}

defineExpose({ collapseAll, expandAll });
</script>

<style scoped></style>
