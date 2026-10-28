import { defineStore } from "pinia";
import * as Shared from "mod_companion_shared";

export const useAssetConversionStore = defineStore("asset-conversion", () => {
    const conversions = ref<Map<Shared.Asset.AssetId, Shared.Conversion.State>>(new Map());
    const conversionsLastChangeTime = ref<number>(0);
    const events = ref<Shared.Conversion.ConversionEvent[]>([]);
    const eventsLastChangeTime = ref<number>(0);
    const activeEvent = ref<Shared.Conversion.ConversionEvent | undefined>();
    const summary = ref<Shared.Conversion.SharedConversionSummary>({
        currentStatus: "idle",
        totalSum: 0,
        queueLength: 0,
    });

    window.electronAPI.conversion.subscribeUpdated((event) => {
        const time1 = event.conversionsLastChangeTime?.getTime();
        if (time1 !== undefined && conversionsLastChangeTime.value !== time1) {
            conversions.value = event.conversions;
            conversionsLastChangeTime.value = time1;
        }

        const time2 = event.eventsLastChangeTime?.getTime();
        if (time2 !== undefined && eventsLastChangeTime.value !== time2) {
            events.value = event.events;
            eventsLastChangeTime.value = time2;
        }
        summary.value = event.summary;
    });

    function getState(id: Shared.Asset.AssetId): Shared.Conversion.State {
        return conversions.value.get(id) ?? Shared.Conversion.State.Unknown;
    }

    function enqueue(id: Shared.Asset.AssetId): void {
        window.electronAPI.conversion.enqueue(id);
    }

    function enqueueAll(): void {
        window.electronAPI.conversion.enqueueAll();
    }

    async function _fetchState() {
        const state = await window.electronAPI.conversion.getState();
        conversions.value = state.conversions;
    }

    function setActive(event: Shared.Conversion.ConversionEvent | undefined): void {
        activeEvent.value = event;
    }

    _fetchState();
    window.electronAPI.conversion.startAgent();

    return { conversions, conversionEvents: events, activeEvent, summary, getState, enqueue, enqueueAll, setActive };
});
