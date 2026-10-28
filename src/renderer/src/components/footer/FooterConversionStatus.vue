<template>
    <UPopover v-model:open="open">
        <UButton
            size="xs"
            variant="ghost"
            color="primary"
            class="text-magenta-900 hover:bg-magenta-400 active:bg-magenta-500 font-semibold"
        >
            <span v-if="status === 'idle'">Conversion Agent Idle</span>
            <span v-if="status === 'working'" class="flex items-center gap-1">
                <MConversionStateIcon :state="Shared.Conversion.State.InProgress" no-color class="text-magenta-900" />
                <span>Conversion Agent Busy</span>
            </span>
            <span v-if="queueLength > 0">
                (<span class="tabular-nums">{{ queueLength }}</span> in queue)
            </span>
        </UButton>
        <template #content>
            <div class="p-2 text-sm select-none max-h-120 grid grid-cols-1 grid-rows-1">
                <template v-if="events.length > 0">
                    <div ref="list" class="h-full overflow-y-auto grid grid-cols-[auto_minmax(0,1fr)_auto_auto] gap-2">
                        <template v-for="(conv, i) in events" :key="i">
                            <USeparator v-if="i !== 0" class="col-span-full" />
                            <div class="grid col-span-full grid-cols-subgrid items-center">
                                <ConversionsCellTime v-if="conv.endTime" :date-time="conv.endTime" />
                                <span v-else></span>
                                <ConversionsCellAsset :asset-id="conv.assetId" />
                                <ConversionsCellDuration :start-time="conv.startTime" :end-time="conv.endTime" />
                                <MConversionStateBadge
                                    :state="_.last(conv.stateHistory) ?? Shared.Conversion.State.Unknown"
                                    variant="label"
                                />
                            </div>
                        </template>
                    </div>
                </template>
                <template v-else>
                    <div class="w-40 text-muted text-center">No conversions yet</div>
                </template>
            </div>
        </template>
    </UPopover>
</template>

<script setup lang="ts">
import { useAssetConversionStore } from "~/store/AssetConversionStore.js";
import * as Shared from "mod_companion_shared";
import * as _ from "lodash";

const MAX_ITEMS = 30;

const listRef = useTemplateRef("list");

const open = ref(false);

const conversionStore = useAssetConversionStore();
const status = computed(() => conversionStore.summary.currentStatus);
const queueLength = computed(() => conversionStore.summary.queueLength);

const events = computed(() => conversionStore.conversionEvents.slice(-MAX_ITEMS));

watch(events, () => {
    if (!open.value) return;
    nextTick(() => {
        if (listRef.value) {
            listRef.value.scrollTop = listRef.value.scrollHeight;
        }
    });
});
</script>

<style scoped></style>
