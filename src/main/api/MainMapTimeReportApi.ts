import { ipcMain } from "electron";
import fs from "fs/promises";
import { existsSync } from "fs";
import * as sourcelib from "sourcelib";
import * as Shared from "mod_companion_shared";
import * as Core from "mod_companion_core";

export function registerMapTimeReportApi(): boolean {
    ipcMain.handle(Shared.Ipc.Channels.MapCreateTimeReport, (e, mapNames: string[]) => _createTimeReport(mapNames));
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

async function _createTimeReport(mapNames: string[]): Promise<Shared.Map.TimeReport> {
    const report: Shared.Map.TimeReport = {
        maps: new Map(),
        totals: new Map(),
    };

    for (const mapName of mapNames) {
        for (const step of reportExtensions) {
            const extension = _getReportExtension(step);
            if (!extension) continue;

            const relativeReportPath = Shared.Paths.addExtension(
                Shared.Paths.createPath(mapName, Shared.Paths.PathBases.ContentMaps),
                extension,
            );
            const absReportPath = Shared.Paths.transformPathBase(
                relativeReportPath,
                Shared.Paths.PathBases.Absolute,
                Core.ConfigSystem.getAppConfig(),
            );
            if (!absReportPath) continue;
            if (!existsSync(absReportPath.path)) continue;

            const logContents = await fs.readFile(absReportPath.path, { encoding: "utf-8" });
            const seconds = _getCompileTimeSeconds(logContents);
            if (seconds === undefined) continue;

            const key = Shared.Map.createMapPathAndStep(mapName, step);
            report.maps.set(key, seconds);

            const mapTotal = report.totals.get(mapName) ?? 0;
            report.totals.set(mapName, mapTotal + seconds);
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
