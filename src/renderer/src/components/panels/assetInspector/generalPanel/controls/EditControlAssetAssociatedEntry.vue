<template>
    <div class="flex gap-2 items-center">
        <UIcon :name="entry.icon" />
        <span>{{ entry.name }}</span>
    </div>
    <MFilePathInput v-model="file" class="grow" :base="Shared.Paths.PathBases.Root" @change="emit('updated', file)" />
</template>

<script setup lang="ts">
import * as Shared from "mod_companion_shared";

const props = defineProps<{ file: string; entry: Shared.Asset.AssociatedFilesEntry }>();
const file = ref(props.file);
watch(
    () => props.file,
    (val) => {
        file.value = val;
    },
);

const emit = defineEmits<{ updated: [newText: string] }>();
</script>

<style scoped></style>
