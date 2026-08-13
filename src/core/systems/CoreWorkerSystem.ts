import worker_threads from "node:worker_threads";
import * as pathe from "pathe";
import * as Shared from "mod_companion_shared";
import { getRootDir } from "../helpers/CoreFilesystem.js";
import { AppWorkerData } from "mod_companion_shared/SharedWorkers.js";
import { ConfigSystem } from "./CoreConfigSystem.js";
import { Logger } from "./CoreLogSystem.js";

const workerList: worker_threads.Worker[] = [];

export const WorkerSystem = {
    initSystem(): boolean {
        return true;
    },
    deinitSystem(): void {
        for (const worker of workerList) {
            worker.terminate();
        }
    },
    createWorker<K extends Shared.Workers.WorkerFile>(
        workerFile: K,
        workerArgs: Shared.Workers.WorkerArgs[K],
        doneCallback?: (payload: Shared.Workers.WorkerDoneResponses[K]) => void,
        postCallback?: (payload: Shared.Workers.WorkerPostResponses[K]) => void,
    ): worker_threads.Worker {
        const data: AppWorkerData<Shared.Workers.WorkerArgs[K]> = {
            args: workerArgs,
            common: {
                appConfig: ConfigSystem.getAppConfig(),
            },
        };

        const workerStartFile = pathe.join(getRootDir(), "core", "workers", workerFile + ".cjs");
        const workerThread = new worker_threads.Worker(workerStartFile, {
            workerData: data,
            // execArgv: ["--inspect"], // enable if needed for debugging
        });

        workerList.push(workerThread);

        workerThread.on("exit", () => {
            const index = workerList.indexOf(workerThread);
            if (index >= 0) {
                workerList.splice(index, 1);
            }
        });

        workerThread.on("message", (data: Shared.Workers.WorkerResponse<Shared.Workers.ResponseType, any>) => {
            if (data.type === Shared.Workers.ResponseType.Log) {
                Logger.processLog(data.payload, true);
            } else if (data.type === Shared.Workers.ResponseType.Done) {
                doneCallback?.(data.payload as Shared.Workers.WorkerDoneResponses[K]);
            } else if (data.type === Shared.Workers.ResponseType.Post) {
                postCallback?.(data.payload as Shared.Workers.WorkerPostResponses[K]);
            }
        });

        return workerThread;
    },
    createResultWorker<K extends Shared.Workers.WorkerFile>(
        workerFile: K,
        workerArgs: Shared.Workers.WorkerArgs[K],
        postCallback?: (payload: Shared.Workers.WorkerPostResponses[K]) => void,
    ): Promise<Shared.Workers.WorkerDoneResponses[K] | undefined> {
        return new Promise((resolve) => {
            let result: Shared.Workers.WorkerDoneResponses[K] | undefined = undefined;
            const worker = WorkerSystem.createWorker(
                workerFile,
                workerArgs,
                (payload) => (result = payload),
                postCallback,
            );
            worker.on("exit", () => resolve(result));
        });
    },
};
