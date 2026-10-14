import { ipcMain } from "electron";
import fs from "fs/promises";
import { existsSync } from "fs";
import * as sourcelib from "sourcelib";

import * as Core from "mod_companion_core";
import * as Shared from "mod_companion_shared";

export function registerMapTimeReportApi(): boolean {
    ipcMain.handle(Shared.Ipc.Channels.MapCreateTimeReport, (e, mapPaths: Shared.Paths.Path[]) =>
        _createTimeReport(mapPaths),
    );
    return true;
}

const reportExtensions: Shared.Map.CompileStep[] = [
    Shared.Map.CompileStep.VBsp,
    Shared.Map.CompileStep.VVis,
    Shared.Map.CompileStep.VRad,
];

function _getReportExtension(step: Shared.Map.CompileStep) {
    switch (step) {
        case Shared.Map.CompileStep.VBsp:
            return ".report_vbsp.vdf";
        case Shared.Map.CompileStep.VVis:
            return ".report_vvis.vdf";
        case Shared.Map.CompileStep.VRad:
            return ".report_vrad.vdf";
        default:
            return undefined;
    }
}

async function _createTimeReport(mapPaths: Shared.Paths.Path[]): Promise<Shared.Map.TimeReport> {
    const report: Shared.Map.TimeReport = {
        maps: new Map(),
        totals: new Map(),
    };

    for (const mapPath of mapPaths) {
        const absMapPath = Shared.Paths.transformPathBase(
            mapPath,
            Shared.Paths.PathBases.Absolute,
            Core.ConfigSystem.getAppConfig(),
        );
        if (!absMapPath) {
            Core.Logger.warning(
                Shared.Log.Channel.MapCompile,
                "Cannot create time report for map",
                mapPath,
                "because the path failed to resolve as an absolute path",
            );
            continue;
        }

        for (const step of reportExtensions) {
            const extension = _getReportExtension(step);
            if (!extension) continue;

            const absReportPath = Shared.Paths.changeExtension(absMapPath, extension);

            if (!existsSync(absReportPath.path)) continue;

            const logContents = await fs.readFile(absReportPath.path, { encoding: "utf-8" });
            const seconds = _getCompileTimeSeconds(logContents);
            if (seconds === undefined) continue;

            const key: Shared.Map.TimeReportMapStep = { map: mapPath, step };

            report.maps.set(key, seconds);

            const mapTotal = report.totals.get(mapPath) ?? 0;
            report.totals.set(mapPath, mapTotal + seconds);
        }
    }

    return report;
}

function _getCompileTimeSeconds(logContents: string): number | undefined {
    const doc = sourcelib.kv.KvParser.parseText(logContents);
    for (const root of doc.getRootItems()) {
        if (root.getKey().getUnquotedContent() !== "report") continue;

        const children = root.getChildren();
        if (!children) continue;

        for (const child of children) {
            if (child.getKey().getUnquotedContent() !== "total_seconds") continue;

            const values = child.getValues();
            if (!values || values.length < 1) continue;

            const val = values[0].getUnquotedContent();
            return Number.parseFloat(val);
        }
    }

    return undefined;
}
