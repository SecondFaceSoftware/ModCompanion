<template>
    <MPanelRoot>
        <template #header>
            <div class="grid gap-2 grid-cols-2 items-start justify-items-end">
                <div class="flex gap-2 w-full items-center">
                    <UIcon class="size-10 text-blue-300 shrink-0" :name="getFileTypeIcon(fileType)" />
                    <div class="grow shrink select-none">
                        <div>{{ fileName }}</div>
                        <div v-if="entry?.fileSize !== undefined" class="text-sm tabular-nums flex gap-2">
                            <span>{{ fileSize(entry.fileSize) }}</span>
                            <span>{{ getFileTypeName(fileType) }}</span>
                        </div>
                    </div>
                </div>

                <div class="flex gap-2">
                    <UButton
                        v-if="editing"
                        size="xs"
                        label="Save"
                        :icon="AppDesign.Icons.Save"
                        :disabled="!unsavedChanges"
                        @click="handleSave"
                    />
                    <UButton size="xs" label="Open" :icon="AppDesign.Icons.ActionLaunchFile" @click="handleOpen" />
                    <UButton
                        size="xs"
                        label="Explore to"
                        :icon="AppDesign.Icons.ActionBrowseToFolder"
                        @click="handleExplore"
                    />
                </div>
            </div>
        </template>
        <div class="grid grid-cols-1 grid-rows-1 gap-2 h-full">
            <component
                :is="getFileInspectorComponent(fileInspector)"
                :path="absFilePath"
                @has-changed="handleHasChanged"
            />
        </div>
    </MPanelRoot>
</template>

<script setup lang="ts">
import { AppDesign } from "~/design/AppDesign.js";
import {
    getFileInspectorComponent,
    getFileInspectorFromType,
    getFileType,
    getFileTypeIcon,
    getFileTypeName,
    hasEditor,
} from "~/helper/FileInspectorHelper.js";
import * as pathe from "pathe";
import { getAppConfig } from "~/renderer-config.js";
import * as Shared from "mod_companion_shared";
import { fileSize } from "humanize-plus";
import { computedAsync, watchImmediate } from "@vueuse/core";
import { FileInspectorBehavior } from "~/components/panels/fileInspector/FileInspector.model.js";
import { useEvent } from "~/composables/useEvent.js";
import { usePanelsStore } from "~/store/PanelsStore.js";

const panelsStore = usePanelsStore();
const props = defineProps<{ file: string; panelId: string }>();

const filePath = computed(() => Shared.Paths.createPath(props.file, Shared.Paths.PathBases.Root));

const absFilePath = computed(() =>
    Shared.Paths.transformPathBase(filePath.value, Shared.Paths.PathBases.Absolute, getAppConfig()),
);
const fileName = computed(() => pathe.basename(props.file));
const fileType = computed(() => getFileType(fileName.value));
const fileInspector = computed(() => getFileInspectorFromType(fileType.value));

const editing = computed(() => hasEditor(fileInspector.value));
const unsavedChanges = ref(false);

const saveEvent = useEvent<void>();
provide(FileInspectorBehavior.FileEditorInjectKey, {
    saveEvent,
});

const shortcuts = inject(FileInspectorBehavior.ShortcutsInjectKey);
if (shortcuts) {
    watchImmediate(shortcuts, (s) => {
        s.onSave.on(() => saveEvent.call());
    });
}

function handleHasChanged(changed: boolean): void {
    unsavedChanges.value = changed;
    if (changed) {
        panelsStore.makeNonTemporary(props.panelId);
    }
    panelsStore.makeUnsaved(props.panelId, changed);
}

const entry = computedAsync(() => window.electronAPI.fileBrowser.getFileEntry(filePath.value), undefined);

function handleExplore() {
    window.electronAPI.fileBrowser.browseTo(filePath.value);
}

function handleOpen() {
    window.electronAPI.fileBrowser.open(filePath.value);
}

function handleSave() {
    if (absFilePath.value) {
        saveEvent.call();
    }
}
</script>

<style scoped></style>
