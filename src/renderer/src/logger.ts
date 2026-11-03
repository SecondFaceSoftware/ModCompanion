import { useMessageLogStore } from "~/store/MessageLogStore.js";
import * as Shared from "mod_companion_shared";

export const Logger = {
    processLog(logEvent: Shared.Log.Event, replicateToMain: boolean = false): void {
        Shared.Log.printLogEvent(logEvent);

        useMessageLogStore().add(logEvent);

        if (replicateToMain) {
            window.electronAPI.log.sendFromRenderer(logEvent);
        }
    },
    debug(channel: Shared.Log.Channel, ...data: any[]) {
        Logger.processLog({ data, channel, time: new Date(), type: Shared.Log.Type.Debug }, true);
    },
    info(channel: Shared.Log.Channel, ...data: any[]) {
        Logger.processLog({ data, channel, time: new Date(), type: Shared.Log.Type.Info }, true);
    },
    warning(channel: Shared.Log.Channel, ...data: any[]) {
        Logger.processLog({ data, channel, time: new Date(), type: Shared.Log.Type.Warning }, true);
    },
    error(channel: Shared.Log.Channel, ...data: any[]) {
        Logger.processLog({ data, channel, time: new Date(), type: Shared.Log.Type.Error }, true);
    },
    init() {
        window.electronAPI.log.subscribeSendFromMain((logEvent) => {
            Logger.processLog(logEvent, false);
        });
    },
    dataToString(data: any[]) {
        return data.map((d) => String(d)).join(" ");
    },
};
