import * as AWS from "@aws-sdk/client-s3";
import { ConfigSystem } from "./CoreConfigSystem.js";
import { createWriteStream } from "node:fs";
import fs from "node:fs/promises";
import { pipeline } from "node:stream/promises";
import { Logger } from "./CoreLogSystem.js";
import humanizePlus from "humanize-plus";
import * as Shared from "mod_companion_shared";

let s3Client: AWS.S3 | undefined = undefined;
let s3Bucket: string | undefined = undefined;
let unconfigured = false;

const RETRIES = 3;

export const ArtifactCloudSystem = {
    async initSystem() {
        const config = ConfigSystem.getAppConfig();
        if (
            !config.artifactCloud ||
            !config.artifactCloud.s3 ||
            !config.artifactCloud.s3.clientConfig ||
            !config.artifactCloud.s3.bucket
        ) {
            Logger.warning(Shared.Log.Channel.ArtifactCloud, "Artifact cloud not configured. Disabling system");
            unconfigured = true;
        }

        return true;
    },
    async isCloudConnected(): Promise<boolean> {
        const connected = await _useS3(async () => true);
        return connected ?? false;
    },
    async listAllObjects() {
        return _useS3(async (client, bucket) => {
            const response = await client.listObjectsV2({ Bucket: bucket });
            return response?.Contents;
        });
    },
    async listMaps(): Promise<Shared.ArtifactCloud.ListAllMapsReport | undefined> {
        return _useS3(async (client, bucket): Promise<Shared.ArtifactCloud.ListAllMapsReport | undefined> => {
            const response = await client.listObjectsV2({
                Bucket: bucket,
                Prefix: ConfigSystem.getAppConfig().artifactCloud?.s3?.mapsPrefix ?? "",
            });
            const contents = response?.Contents;
            if (contents === undefined || contents.length === 0) {
                return undefined;
            }

            const mapInfos = new Map<string, Shared.ArtifactCloud.MapInfo[]>();
            for (const content of contents) {
                if (content.Size === undefined || content.LastModified === undefined || content.Key === undefined)
                    continue;

                const mapName = content.Key;

                const entry: Shared.ArtifactCloud.MapInfo = {
                    size: content.Size,
                    dateModified: content.LastModified,
                    objectKey: content.Key,
                };

                if (!mapInfos.has(mapName)) {
                    mapInfos.set(mapName, [entry]);
                } else {
                    mapInfos.get(mapName)?.push(entry);
                }
            }

            for (const arr of mapInfos.values()) {
                arr.sort((a, b) => b.dateModified.getTime() - a.dateModified.getTime());
            }

            return { maps: mapInfos };
        });
    },
    async downloadMap(objectKey: string, mapName: string): Promise<boolean> {
        const config = ConfigSystem.getAppConfig();

        const relativeMapPath = Shared.Paths.createPath(mapName, Shared.Paths.PathBases.ContentMaps);

        const bspPath = Shared.Paths.getBspPathFromVmfPath(relativeMapPath);
        if (!bspPath) {
            Logger.warning(
                Shared.Log.Channel.ArtifactCloud,
                "Failed to download map because",
                relativeMapPath,
                "doesn't map to a valid bsp path",
            );
            return false;
        }
        const absBspPath = Shared.Paths.transformPathBase(bspPath, Shared.Paths.PathBases.Absolute, config);
        if (!absBspPath) {
            Logger.warning(
                Shared.Log.Channel.ArtifactCloud,
                "Failed to download map because",
                bspPath,
                "doesn't resolve to an absolute path",
            );
            return false;
        }

        const result = await _useS3(async (client, bucket): Promise<boolean> => {
            Logger.info(Shared.Log.Channel.ArtifactCloud, `Downloading map object ${objectKey} to ${absBspPath.path}`);
            const response = await client.getObject({ Bucket: bucket, Key: objectKey });
            const s3Stream = response.Body as NodeJS.ReadableStream;
            if (!s3Stream) {
                Logger.warning(Shared.Log.Channel.ArtifactCloud, "Failed to establish S3 stream");
                return false;
            }

            if (response.ContentLength) {
                Logger.info(
                    Shared.Log.Channel.ArtifactCloud,
                    `Map file is ${humanizePlus.fileSize(response.ContentLength)}`,
                );
            }

            try {
                await fs.rm(absBspPath.path);
            } catch (e) {
                // ignore. probably just doesn't exist
            }

            const writeStream = createWriteStream(absBspPath.path);
            await pipeline(s3Stream, writeStream);
            Logger.info(Shared.Log.Channel.ArtifactCloud, `Download complete`);
            return true;
        });
        return result ?? false;
    },
    async deleteMap(objectKey: string): Promise<boolean> {
        const result = await _useS3(async (client, bucket): Promise<boolean> => {
            Logger.info(Shared.Log.Channel.ArtifactCloud, "Deleting map object", objectKey);
            await client.deleteObject({ Bucket: bucket, Key: objectKey });
            return true;
        });
        return result ?? false;
    },
};

function _sleep(timeMs: number): Promise<void> {
    return new Promise((resolve) => {
        setTimeout(resolve, timeMs);
    });
}

async function _connect() {
    const config = ConfigSystem.getAppConfig();
    const client = new AWS.S3(config.artifactCloud?.s3?.clientConfig);
    const bucket = config.artifactCloud?.s3?.bucket;

    if (!client) {
        Logger.warning(Shared.Log.Channel.ArtifactCloud, "Client config missing, cannot connect");
        return;
    }

    if (!bucket) {
        Logger.warning(Shared.Log.Channel.ArtifactCloud, "Bucket config missing, cannot connect");
        return;
    }

    try {
        const response = await client.listBuckets();
        const bucketFound = response.Buckets?.some((b) => b.Name === bucket);
        if (!bucketFound) {
            Logger.warning(
                Shared.Log.Channel.ArtifactCloud,
                `Successfully connected to S3 but couldn't find bucket ${bucket}. Buckets are:`,
                response.Buckets?.map((b) => b.Name).join(", ") ?? "(none)",
            );
        } else {
            s3Client = client;
            s3Bucket = bucket;
        }
    } catch (e) {}
}

async function _useS3<T>(callback: (client: AWS.S3, bucket: string) => Promise<T>): Promise<T | undefined> {
    try {
        if (unconfigured) return undefined;

        for (let i = 0; i < RETRIES; i++) {
            if (s3Client && s3Bucket) {
                return callback(s3Client, s3Bucket);
            }

            await _connect();
            await _sleep(2000);
        }

        return undefined;
    } catch (e) {
        return undefined;
    }
}
