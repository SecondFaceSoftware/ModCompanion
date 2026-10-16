import { program } from "commander";
import * as Core from "mod_companion_core";
import * as Shared from "mod_companion_shared";
import chalk from "chalk";
import humanizePlus from "humanize-plus";
import * as fs from "node:fs/promises";

program.name("Mod Companion CLI").description("Headless cli for mod companion tasks without GUI");

program
    .command("convert")
    .option("-f, --force", "Convert all assets, no matter their state")
    .option("-l, --list", "List all assets and their conversion state")
    .option(
        "-d, --dry",
        "Don't run the converter, just show what would be converted. Same as list but only lists assets with pending state",
    )
    .option("-v, --verbose", "Print more details for troubleshooting")
    .argument(
        "[files...]",
        "Paths to assets (.mca files) that you want to convert explicitly. Relative to the repo root (Starting with content/...)",
    )
    .action(async (files, opts) => {
        if (opts.verbose) {
            Core.Logger.debug(Shared.Log.Channel.Cli, "Root Dir", Core.FileSystem.getRootDir());
            Core.Logger.debug(Shared.Log.Channel.Cli, "Main Assets Dir", Core.FileSystem.getMainAssetsDir());
        }

        await Core.ConfigSystem.initConfigSystem();
        Core.MareTfSystem.initSystem();
        if (opts.verbose)
            Core.Logger.debug(Shared.Log.Channel.Cli, "Maretf Path", Core.MareTfSystem.getMareTfBinaryPath());

        Core.FileBrowserSystem.initSystem(undefined, true);
        await new Promise<Shared.Asset.AssetRescanEvent>((resolve) => {
            Core.AssetRepositorySystem.initSystem({ scanFunc: resolve });
        });
        const assets = Core.AssetRepositorySystem.getAssetMap();

        if (files.length > 0) {
            const assets = Core.AssetRepositorySystem.getAssetsFromMcaFiles(files);
            for (const asset of assets) {
                Core.ConversionAgentSystem.enqueue(asset.def.id, opts.force);
            }
        } else {
            await Core.ConversionAgentSystem.initStates(assets);
        }

        if (opts.list || opts.dry) {
            if (opts.dry) {
                Core.Logger.info(Shared.Log.Channel.Cli, "Assets that would be converted if this wasn't a dry run:");
            }

            let itemCount = 0;

            for (const c of Core.ConversionAgentSystem.getConversionsMap().values()) {
                if (opts.dry && c.state !== Shared.Conversion.State.Pending) continue;
                const asset = assets.get(c.assetId);
                if (!asset) {
                    continue;
                }
                const stateName = Shared.Conversion.getConversionStateName(c.state).padStart(11, " ");
                const typeName = Shared.Asset.getAssetTypeName(asset.def.type).padEnd(7, " ");
                const colorFunc = getConversionStateChalkColor(c.state);
                Core.Logger.info(
                    Shared.Log.Channel.Cli,
                    colorFunc(stateName),
                    "-",
                    chalk.yellow(typeName),
                    chalk.gray(asset.defFilePath),
                );
                itemCount++;
            }

            Core.Logger.info(Shared.Log.Channel.Cli, "End of list (", itemCount, ")");
            if (opts.dry) {
                return;
            }
        }

        Core.Logger.info(Shared.Log.Channel.Cli, "Starting to convert assets...");
        const startTime = Date.now();

        let assetCount = 0;
        await Core.ConversionAgentSystem.runAndConvertUntilItIsDone(opts.force && files.length === 0, (assetId) => {
            const asset = assets.get(assetId);
            if (asset) {
                assetCount++;
                Core.Logger.info(
                    Shared.Log.Channel.Cli,
                    chalk.green("Converting"),
                    chalk.yellow(Shared.Asset.getAssetTypeName(asset.def.type)),
                    chalk.gray(asset.defFilePath),
                );
            }
        });

        const endTime = Date.now();
        const duration = (endTime - startTime) / 1000;
        Core.Logger.info(Shared.Log.Channel.Cli, `Done! Converted ${assetCount} assets in ${duration} seconds`);
    });

function getConversionStateChalkColor(state: Shared.Conversion.State) {
    switch (state) {
        case Shared.Conversion.State.Pending:
        case Shared.Conversion.State.PendingForced:
            return chalk.bgGray;
        case Shared.Conversion.State.InProgress:
            return chalk.bgBlue;
        case Shared.Conversion.State.Finished:
            return chalk.bgGreenBright;
        case Shared.Conversion.State.Invalid:
        case Shared.Conversion.State.Failed:
            return chalk.bgRed;
        case Shared.Conversion.State.NoChange:
            return chalk.green;
        case Shared.Conversion.State.Unknown:
        default:
            return (a: string) => a;
    }
}

program
    .command("tc-artifacts")
    .option("-l, --list", "List all artifacts")
    .option("-m, --list-maps", "List all maps and show them pretty")
    .option("-y, --get-latest-maps", "Download latest campaign maps (Those starting with r2_a)")
    .option("-c, --clean", "Delete all non-campaign maps and old campaign maps (60 days or older)")
    .option("-d, --dry", "Dry run. Don't actually do anything, just log what would happen")
    .action(async (opts) => {
        const dry = Boolean(opts.dry);
        const startTime = Date.now();
        await Core.ConfigSystem.initConfigSystem();
        await Core.ArtifactCloudSystem.initSystem();
        const campaignMapPrefix = "r2_a";

        if (!(await Core.ArtifactCloudSystem.isCloudConnected())) {
            Core.Logger.error(Shared.Log.Channel.Cli, chalk.green("Failed to connect to TC Cloud. Aborting"));
            return;
        }
        Core.Logger.info(Shared.Log.Channel.Cli, chalk.green("TC Cloud connected!"));

        if (opts.list) {
            const objects = await Core.ArtifactCloudSystem.listAllObjects();
            if (!objects) {
                Core.Logger.info(Shared.Log.Channel.Cli, "Nothing to list");
                return;
            }

            let totalSize = 0;
            for (const obj of objects) {
                totalSize += obj.Size ?? 0;
                Core.Logger.info(
                    Shared.Log.Channel.Cli,
                    chalk.yellow(humanizePlus.fileSize(obj.Size ?? 0).padStart(10, " ")),
                    obj.Key,
                    chalk.gray(obj.LastModified?.toString()),
                );
            }

            Core.Logger.info(
                Shared.Log.Channel.Cli,
                chalk.yellow(`Summary: ${objects.length} items. ${humanizePlus.fileSize(totalSize)}`),
            );
        }

        if (opts.listMaps) {
            const result = await Core.ArtifactCloudSystem.listMaps();
            if (!result) {
                Core.Logger.info(Shared.Log.Channel.Cli, "Nothing to list");
                return;
            }

            for (const [mapName, infos] of result.maps.entries()) {
                const totalSize = infos.reduce((sum, info) => info.size + sum, 0);
                Core.Logger.info(
                    Shared.Log.Channel.Cli,
                    chalk.blue(`${mapName} (${infos.length}) ${humanizePlus.fileSize(totalSize)}`),
                );
                for (const info of infos) {
                    Core.Logger.info(
                        Shared.Log.Channel.Cli,
                        "-",
                        info.objectKey,
                        chalk.yellow(humanizePlus.fileSize(info.size).padStart(10, " ")),
                        chalk.gray(info.dateModified.toString()),
                    );
                }
            }
        }

        if (opts.getLatestMaps) {
            const result = await Core.ArtifactCloudSystem.listMaps();
            if (!result) {
                Core.Logger.info(Shared.Log.Channel.Cli, "No maps to download");
                return;
            }

            const queue: { map: Shared.Paths.Path; info: Shared.ArtifactCloud.MapInfo }[] = [];
            let sizeSum = 0;
            for (const [map, infos] of result.maps.entries()) {
                if (map.path.startsWith(campaignMapPrefix)) {
                    queue.push({ map, info: infos[0] });
                    sizeSum += infos[0].size;
                }
            }

            Core.Logger.info(
                Shared.Log.Channel.Cli,
                `Starting to download of ${queue.length} maps. ${humanizePlus.fileSize(sizeSum)}`,
            );
            for (const entry of queue) {
                Core.Logger.info(
                    Shared.Log.Channel.Cli,
                    `Downloading ${chalk.blue(entry.map)} ${chalk.yellow(humanizePlus.fileSize(entry.info.size))}...`,
                );
                if (!dry) {
                    await Core.ArtifactCloudSystem.downloadMap(entry.info.objectKey, entry.map);
                }
            }

            const endTime = Date.now();
            const totalTime = (endTime - startTime) / 1000;
            Core.Logger.info(Shared.Log.Channel.Cli, chalk.green(`Done! Took ${totalTime} seconds`));
        }

        if (opts.clean) {
            const result = await Core.ArtifactCloudSystem.listMaps();
            if (!result) {
                Core.Logger.info(Shared.Log.Channel.Cli, "No maps to delete");
                return;
            }

            const now = Date.now();
            const ONE_DAY = 1000 * 60 * 60 * 24;
            const MAX_AGE = ONE_DAY * 60;
            for (const [map, infos] of result.maps.entries()) {
                for (const info of infos) {
                    const ageMillis = now - info.dateModified.getTime();
                    const ageDays = ageMillis / ONE_DAY;
                    const shouldDelete = !map.path.startsWith(campaignMapPrefix) || ageMillis > MAX_AGE;
                    if (!shouldDelete) continue;

                    if (!dry) {
                        await Core.ArtifactCloudSystem.deleteMap(info.objectKey);
                    } else {
                        Core.Logger.info(
                            Shared.Log.Channel.Cli,
                            chalk.gray(`Would now delete map`),
                            chalk.blue(`${map} - ${info.objectKey}`),
                            chalk.yellow(`${ageDays} days old`),
                        );
                    }
                }
            }

            Core.Logger.info(Shared.Log.Channel.Cli, chalk.green("Done deleting maps"));
        }
    });

program
    .command("asset-groups")
    .option("-d, --delete-missing", "Delete references to missing assets")
    .action(async (opts) => {
        await Core.ConfigSystem.initConfigSystem();
        Core.FileBrowserSystem.initSystem(undefined, true);
        Core.Logger.info(Shared.Log.Channel.Cli, "Scanning assets...");
        await new Promise<Shared.Asset.AssetRescanEvent>((resolve) => {
            Core.AssetRepositorySystem.initSystem({ scanFunc: resolve });
        });

        Core.Logger.info(Shared.Log.Channel.Cli, "Scanning asset groups...");
        const groupsResult = await new Promise<Shared.AssetGroup.RescanEvent>((resolve) => {
            Core.AssetGroupsSystem.initSystem(resolve).then(() => Core.AssetGroupsSystem.scan());
        });

        if (!opts.deleteMissing) {
            for (const group of groupsResult.groups.values()) {
                Core.Logger.info(Shared.Log.Channel.Cli, group.def.displayName, chalk.gray(` (${group.id})`));
                for (const assetId of group.def.assets) {
                    const asset = Core.AssetRepositorySystem.getAssetFromId(assetId);
                    if (asset) {
                        Core.Logger.info(
                            Shared.Log.Channel.Cli,
                            chalk.gray(`- `),
                            asset.def.displayName,
                            chalk.gray(` (${assetId})`),
                        );
                    } else {
                        Core.Logger.info(
                            Shared.Log.Channel.Cli,
                            chalk.gray(`- `),
                            chalk.redBright(`${assetId} (MISSING)`),
                        );
                    }
                }
            }
        } else {
            for (const group of groupsResult.groups.values()) {
                const groupCopy = structuredClone(group.def);
                let modified = false;
                for (const assetId of group.def.assets) {
                    const asset = Core.AssetRepositorySystem.getAssetFromId(assetId);
                    if (!asset) {
                        Core.Logger.info(
                            Shared.Log.Channel.Cli,
                            chalk.gray(`Removing`),
                            chalk.redBright(assetId),
                            "from",
                            chalk.blue(group.def.displayName),
                        );

                        groupCopy.assets.splice(groupCopy.assets.indexOf(assetId), 1);
                        modified = true;
                    }
                }

                if (modified) {
                    Core.Logger.info(Shared.Log.Channel.Cli, chalk.gray(`Writing`), chalk.blue(group.filePath));
                    await fs.writeFile(group.filePath, JSON.stringify(groupCopy));
                }
            }
        }
    });

program.parse();
