<template>
    <div>
        <template v-if="model">
            <ChamberSignConfigRoot v-model="model" />
        </template>
        <template v-else>
            <p>Invalid config</p>
        </template>
    </div>
</template>

<script setup lang="ts">
import * as Shared from "mod_companion_shared";
import { watchDeep } from "@vueuse/core";
import * as _ from "lodash";
import { FileInspectorBehavior } from "~/components/panels/fileInspector/FileInspector.model.js";

const props = defineProps<{ path: Shared.Paths.Path }>();

const emit = defineEmits<{ hasChanged: [boolean] }>();

const model = ref<Shared.ChamberSignConfig.SharedChamberSignConfig | undefined>(undefined);

watch(
    () => props.path,
    async () => {
        const fileContents = await window.electronAPI.file.readString(props.path);
        if (!fileContents) {
            return;
        }

        const parsed = JSON.parse(fileContents);
        model.value = parsed;
    },
    { immediate: true },
);

const injected = inject(FileInspectorBehavior.FileEditorInjectKey);
if (injected) {
    injected.saveEvent.on(() => {
        save();
    });
}

const savedModel = ref<Shared.ChamberSignConfig.SharedChamberSignConfig | undefined>(undefined);

watchDeep(model, (newValue, oldModel) => {
    // Initial value
    if (oldModel === undefined) {
        savedModel.value = structuredClone(toRaw(newValue));
        return;
    }

    const isEqual = _.isEqual(toRaw(newValue), toRaw(savedModel.value));
    emit("hasChanged", !isEqual);
});

async function save() {
    if (model.value) {
        await window.electronAPI.file.writeString(props.path, JSON.stringify(model.value, null, 4));
        savedModel.value = structuredClone(toRaw(model.value));
        emit("hasChanged", false);
    }
}
</script>

<style scoped></style>
