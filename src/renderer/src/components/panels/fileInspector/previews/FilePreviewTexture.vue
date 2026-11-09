<template>
    <div>
        <template v-if="!error && !loading">
            <div>
                <img :src="`data:image/png;base64,${extract}`" />
                <MTextArea horiz-scroll>{{ info }}</MTextArea>
            </div>
        </template>
        <template v-else-if="loading">
            <div class="h-full grid place-items-center text-center">
                <span class="flex gap-1 items-center">
                    <UIcon :name="AppDesign.Icons.Loading" class="animate-spin" />
                    <span>Loading...</span>
                </span>
            </div>
        </template>
        <template v-else-if="error">
            <div class="h-full grid place-content-center place-items-center text-center gap-2">
                <span class="block text-lg">Error loading VTF :(</span>
                <UButton label="Try Again" size="lg" @click="loadInfo" />
            </div>
        </template>
    </div>
</template>

<script setup lang="ts">
import * as Shared from "mod_companion_shared";
import { AppDesign } from "~/design/AppDesign.js";
import { Logger } from "~/logger.js";
import { Channel } from "mod_companion_shared/SharedLog.js";
import { watchImmediate } from "@vueuse/core";

const props = defineProps<{ path: Shared.Paths.Path }>();

const loading = ref(false);
const error = ref(false);
const info = ref<Shared.Vtf.SharedVtfInfo | undefined>(undefined);
const extract = ref<string | undefined>(undefined);

watchImmediate(() => props.path, loadInfo);

async function loadInfo() {
    if (loading.value) {
        return;
    }

    loading.value = true;
    error.value = false;
    info.value = undefined;
    try {
        info.value = await window.electronAPI.vtf.getInfo(props.path);
        extract.value = await window.electronAPI.vtf.getExtract(props.path);
        extract.value = extract.value.split(" ")[1];
        loading.value = true;
    } catch (e) {
        error.value = true;
        Logger.warning(Channel.MareTF, "Failed to load VTF for", props.path, e);
    } finally {
        loading.value = false;
    }
}
</script>

<style scoped></style>
