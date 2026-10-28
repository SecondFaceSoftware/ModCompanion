<template>
    <TakeOver :id="TakeOverId.MessageLog">
        <template #toolbar>
            <UCheckbox v-model="showTime" label="Show Time" size="sm" />
            <USeparator orientation="vertical" />
            <UInput v-model="searchFilter" size="sm" class="min-w-30" placeholder="Search" />
            <USelect
                v-model="typeFilter"
                size="sm"
                class="min-w-30"
                multiple
                :items="typeFilterItems"
                value-key="id"
                placeholder="Filter Type"
            />
            <USelect
                v-model="channelFilter"
                size="sm"
                class="min-w-50"
                multiple
                :items="Shared.Log.AllChannels"
                placeholder="Channels"
            />
            <UButton
                variant="ghost"
                size="sm"
                label="Clear"
                :icon="AppDesign.Icons.ActionDelete"
                @click="logStore.clear()"
            />
            <USeparator orientation="vertical" />
        </template>
        <div
            ref="scroller"
            class="h-full grid grid-cols-[auto_auto_auto_1fr] text-xs gap-x-2 overflow-y-auto font-mono content-start"
        >
            <template v-for="(event, i) in events" :key="i">
                <div class="grid col-span-full grid-cols-subgrid p-1 border-b border-b-accented items-center">
                    <MLogTypeIcon :type="event.type" />
                    <div v-show="showTime" class="whitespace-nowrap text-muted tabular-nums">
                        {{ Shared.Log.getLogTime(event.time) }}
                    </div>
                    <div class="whitespace-nowrap">{{ event.channel }}</div>
                    <div :class="getLogTypeTextColorWarnings(event.type)">
                        {{ Logger.dataToString(event.data) }}
                    </div>
                </div>
            </template>
        </div>
    </TakeOver>
</template>

<script setup lang="ts">
import { useMessageLogStore } from "~/store/MessageLogStore.js";
import { AppDesign, getLogTypeTextColorWarnings } from "~/design/AppDesign.js";
import { Logger } from "~/logger.js";
import { useRememberRef } from "~/composables/useRemember.js";
import { TakeOverId } from "~/store/TakeOverStore.js";
import * as Shared from "mod_companion_shared";

const logStore = useMessageLogStore();

function handleTestLog() {
    Logger.debug(Shared.Log.Channel.Generic, "Hello world! Test log debug");
    Logger.info(Shared.Log.Channel.Generic, "Hello world! Test log info");
    Logger.warning(Shared.Log.Channel.Generic, "Hello world! Test log warning");
    Logger.error(Shared.Log.Channel.Generic, "Hello world! Test log error");
}

const showTime = useRememberRef(ref(true), "log-show-time");

const events = computed(() =>
    logStore.logEvents.filter(
        (e) =>
            passesTypeFilter(e.type) &&
            passesChannelFilter(e.channel) &&
            passesSearchFilter(Shared.Log.stringifyLogData(e.data)),
    ),
);

const typeFilter = useRememberRef(ref<Shared.Log.Type[]>([]), "log-type-filter");
const typeFilterItems = Shared.Log.AllTypes.map((t) => ({
    id: t,
    label: Shared.Log.TypeNames[t],
}));
function passesTypeFilter(logType: Shared.Log.Type): boolean {
    return typeFilter.value.length === 0 ? true : typeFilter.value.includes(logType);
}

const channelFilter = useRememberRef(ref<Shared.Log.Channel[]>([]), "log-channel-filter");
function passesChannelFilter(logChannel: Shared.Log.Channel): boolean {
    return channelFilter.value.length === 0 ? true : channelFilter.value.includes(logChannel);
}

const searchFilter = useRememberRef(ref<string>(""), "log-search-filter");
function passesSearchFilter(logMessage: string): boolean {
    return logMessage.toLowerCase().includes(searchFilter.value.toLowerCase());
}

const scroller = useTemplateRef("scroller");

watch(
    () => logStore.logEvents.length,
    () => {
        nextTick(() => {
            if (scroller.value) {
                scroller.value.scrollTop = scroller.value.scrollHeight;
            }
        });
    },
);
</script>

<style scoped></style>
