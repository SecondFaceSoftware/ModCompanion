<template>
    <span
        ref="editableRef"
        :contenteditable="editing ? 'plaintext-only' : 'false'"
        class="outline-0"
        @keydown="handleKeyDown"
        @blur="handleBlur"
    >
        {{ theValue }}
    </span>
</template>

<script setup lang="ts">
const props = defineProps<{
    editing?: boolean;
    value: string;
}>();
const emit = defineEmits<{
    stopEditing: [void];
    changed: [string];
}>();

const editableRef = useTemplateRef("editableRef");

const theValue = ref(props.value);
watch(
    () => props.value,
    (newValue) => (theValue.value = newValue),
);

watch(
    () => props.editing,
    (ed) => {
        nextTick(() => {
            if (ed && editableRef.value) {
                const el = editableRef.value;
                el.focus();

                const range = document.createRange();
                range.selectNodeContents(el);

                const selection = window.getSelection();
                if (selection) {
                    selection.removeAllRanges();
                    selection.addRange(range);
                }
            }

            if (!ed) {
                theValue.value = props.value;
            }
        });
    },
);

function handleKeyDown(event: KeyboardEvent) {
    if (event.key === "Escape" || event.key === "Enter") {
        event.preventDefault();
        event.stopPropagation();
        emit("stopEditing");
    }

    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault();
        event.stopPropagation();
    }
}

function handleBlur() {
    emit("stopEditing");

    const newName = editableRef.value?.innerText;
    if (newName) {
        emit("changed", newName);
    }
}
</script>

<style scoped></style>
