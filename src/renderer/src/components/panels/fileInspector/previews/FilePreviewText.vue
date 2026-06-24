<template>
    <div ref="editor" class="editor"></div>
</template>

<script setup lang="ts">
import * as monaco from "monaco-editor";
import { useAsyncState } from "@vueuse/core";

const props = defineProps<{ path: string }>();

const editorEl = useTemplateRef("editor");
const text = useAsyncState(window.electronAPI.file.readString(props.path), "");

onMounted(() => {
    if (editorEl.value === null) {
        return;
    }

    const editor = monaco.editor.create(editorEl.value, { value: text.state.value, theme: "vs-dark", readOnly: true });
    console.error(editor);
    text.then((value) => {
        editor.setValue(value.state.value ?? "");
        editor.updateOptions({ readOnly: false });
    });
});
</script>

<style scoped></style>
