<template>
    <TakeOver :id="TakeOverId.DevTools" full>
        <div class="p-4 grid content-start gap-2 h-full overflow-y-scroll">
            <UFormField label="Print to Console">
                <UButton label="Debug" @click="() => Logger.debug(Shared.Log.Channel.Generic, 'Hello debug!')" />
                <UButton label="Info" @click="() => Logger.info(Shared.Log.Channel.Generic, 'Hello info!')" />
                <UButton label="Warning" @click="() => Logger.warning(Shared.Log.Channel.Generic, 'Hello warning!')" />
                <UButton label="Error" @click="() => Logger.error(Shared.Log.Channel.Generic, 'Hello error!')" />
            </UFormField>

            <UCollapsible>
                <UButton label="Show app config" />
                <template #content>
                    <MTextArea class="w-200">{{ cfgString }}</MTextArea>
                </template>
            </UCollapsible>

            <UFormField label="Tasks">
                <UButton label="Create Fake Task" @click="handleCreateFakeTask" />
            </UFormField>
        </div>
    </TakeOver>
</template>

<script setup lang="ts">
import { TakeOverId } from "~/store/TakeOverStore.js";
import { Logger } from "~/logger.js";
import * as Shared from "mod_companion_shared";
import { configInitializedEvent } from "~/renderer-config.js";

const cfgString = ref("");
configInitializedEvent.on((payload) => {
    cfgString.value = JSON.stringify(payload, null, 4);
});

function handleCreateFakeTask() {
    window.electronAPI.task.createFakeTask();
}
</script>

<style scoped></style>
