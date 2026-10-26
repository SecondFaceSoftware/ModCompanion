<template>
    <TakeOver :id="TakeOverId.FindAnything" full>
        <div class="grid justify-center gap-4">
            <UInput
                ref="search"
                v-model="findAnythingStore.search"
                class="min-w-100 mt-4"
                placeholder="Search for anything"
                autofocus
                size="xl"
            />
            <div class="grid w-150 text-center">WIP!</div>
        </div>
    </TakeOver>
</template>

<script setup lang="ts">
import { TakeOverId, useTakeOverStore } from "~/store/TakeOverStore.js";
import { useFindAnythingStore } from "~/store/FindAnythingStore.js";

const findAnythingStore = useFindAnythingStore();
const takeOverStore = useTakeOverStore();

const searchInput = useTemplateRef("search");

watch(
    () => takeOverStore.openTakeOver,
    (newTakeover) => {
        if (newTakeover === TakeOverId.FindAnything) {
            handleTakeOverOpened();
        }
    },
);

function handleTakeOverOpened(): void {
    searchInput.value?.inputRef?.focus();
}
</script>

<style scoped></style>
