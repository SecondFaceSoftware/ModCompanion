import * as Shared from "mod_companion_shared";
import * as worker_threads from "node:worker_threads";

/** Helper function to manage IO *inside* the worker */
export function useWorkerThreadData<K extends Shared.Workers.WorkerFile>(): Shared.Workers.AppWorkerData<
    Shared.Workers.WorkerArgs[K]
> {
    const data = worker_threads.workerData as Shared.Workers.AppWorkerData<Shared.Workers.WorkerArgs[K]>;
    return data;
}

export function useWorkerThreadResponse<K extends Shared.Workers.WorkerFile>(): Shared.Workers.AppWorkerResponses<
    Shared.Workers.WorkerDoneResponses[K],
    Shared.Workers.WorkerPostResponses[K]
> {
    function sendLog(channel: Shared.Log.Channel, type: Shared.Log.Type, data: any[]) {
        const message: Shared.Workers.WorkerResponseLog = {
            type: Shared.Workers.ResponseType.Log,
            payload: { data, channel, time: new Date(), type },
        };
        worker_threads.parentPort?.postMessage(message);
    }

    function sendDone(payload: Shared.Workers.WorkerDoneResponses[K]) {
        const message: Shared.Workers.WorkerResponseDone<Shared.Workers.WorkerDoneResponses[K]> = {
            type: Shared.Workers.ResponseType.Done,
            payload,
        };
        worker_threads.parentPort?.postMessage(message);
    }

    function sendPost(payload: Shared.Workers.WorkerPostResponses[K]) {
        const message: Shared.Workers.WorkerResponsePost<Shared.Workers.WorkerPostResponses[K]> = {
            type: Shared.Workers.ResponseType.Post,
            payload,
        };
        worker_threads.parentPort?.postMessage(message);
    }

    return {
        log: {
            debug: (channel: Shared.Log.Channel, ...data: any[]) => sendLog(channel, Shared.Log.Type.Debug, data),
            info: (channel: Shared.Log.Channel, ...data: any[]) => sendLog(channel, Shared.Log.Type.Info, data),
            warning: (channel: Shared.Log.Channel, ...data: any[]) => sendLog(channel, Shared.Log.Type.Warning, data),
            error: (channel: Shared.Log.Channel, ...data: any[]) => sendLog(channel, Shared.Log.Type.Error, data),
        },
        done: sendDone,
        post: sendPost,
    };
}
