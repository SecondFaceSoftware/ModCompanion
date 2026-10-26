<template>
    <UTooltip text="Ctrl+P">
        <UButton
            :icon="AppDesign.Icons.FindAnything"
            label="Find Anything"
            variant="outline"
            size="sm"
            class="text-muted"
            @click="handleClick"
        />
    </UTooltip>
</template>

<script setup lang="ts">
import { AppDesign } from "~/design/AppDesign.js";
import { TakeOverId, useTakeOverStore } from "~/store/TakeOverStore.js";

function handleClick(): void {
    useTakeOverStore().toggle(TakeOverId.FindAnything);
}
</script>

<style scoped></style>
