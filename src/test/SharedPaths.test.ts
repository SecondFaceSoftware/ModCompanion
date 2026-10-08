import { expect, test } from "vitest";
import * as Paths from "../shared/SharedPaths";
import * as pathe from "pathe";
import * as path from "node:path";
import { AppConfig } from "../shared/SharedAppConfig";

const testConfig: AppConfig = {
    gameName: "revolution",
    rootPath: "S:/Git/PortalRevolution2",
    contentPath: "S:/Git/PortalRevolution2/content/revolution",
    gamePath: "S:/Git/PortalRevolution2/game/revolution",
    gameRootPath: "S:/Git/PortalRevolution2/game",
    textureSourcePath: "S:/Git/PortalRevolution2/content/revolution/materialsrc",
    textureOutputPath: "S:/Git/PortalRevolution2/game/revolution/materials",
    modelSourcePath: "S:/Git/PortalRevolution2/content/revolution/models",
    modelOutputPath: "S:/Git/PortalRevolution2/game/revolution/models",
    mapSourcePath: "S:/Git/PortalRevolution2/content/revolution/maps",
    mapOutputPath: "S:/Git/PortalRevolution2/game/revolution/maps",
    scriptsPath: "S:/Git/PortalRevolution2/game/revolution/scripts",
    studioMdlPath: "S:/Git/PortalRevolution2/game/bin/win64/studiomdl.exe",
    hlmvPath: "S:/Git/PortalRevolution2/game/bin/win64/hlmv.exe",
    hammerPath: "S:/Git/PortalRevolution2/game/bin/win64/hammer.exe",
    faceposerPath: "S:/Git/PortalRevolution2/game/bin/win64/hlfaceposer.exe",
    mdlInfoPath: "S:/Git/PortalRevolution2/game/bin/win64/mdlinfo.exe",
    gameExePath: "S:/Git/PortalRevolution2/game/bin/win64/revolution.exe",
    vbspExePath: "S:/Git/PortalRevolution2/game/bin/win64/vbsp.exe",
    postcompilerExePath: "S:/Git/PortalRevolution2/game/bin/win64/postcompiler/postcompiler.exe",
    vvisExePath: "S:/Git/PortalRevolution2/game/bin/win64/vvis.exe",
    vradExePath: "S:/Git/PortalRevolution2/game/bin/win64/vrad.exe",
    vbspArgs: "-report -game revolution",
    postcompilerArgs: "--nopack",
    vvisArgs: "-report -game revolution",
    vradArgs: "-report -PortalTraversalLighting -textureshadows -StaticPropLighting -StaticPropPolys -game revolution",
    cubemapArgs: "-buildcubemaps -novid -windowed -w 800 -h 600 -condebug -bordered",
    mapSourceDirs: [],
    mapPresets: {},
    assetDefaults: {},
    artifactCloud: {},
};

test("Transform root relative to game relative", () => {
    expect(
        Paths.transformPathBase(
            Paths.createPath("game/revolution/scripts/test.txt", Paths.PathBases.RootRelative),
            Paths.PathBases.GameRelative,
            testConfig,
        ),
    ).toEqual<Paths.Path<typeof Paths.PathBases.GameRelative>>({
        path: "scripts/test.txt",
        base: Paths.PathBases.GameRelative,
    });
});

test("Transform root relative to content relative", () => {
    expect(
        Paths.transformPathBase(
            Paths.createPath("content/revolution/materialsrc/lity.png", Paths.PathBases.RootRelative),
            Paths.PathBases.ContentRelative,
            testConfig,
        ),
    ).toEqual<Paths.Path<typeof Paths.PathBases.ContentRelative>>({
        path: "materialsrc/lity.png",
        base: Paths.PathBases.ContentRelative,
    });
});

test("Transform root relative to absolute", () => {
    expect(
        Paths.transformPathBase(
            Paths.createPath("content/revolution/materialsrc/lity.png", Paths.PathBases.RootRelative),
            Paths.PathBases.Absolute,
            testConfig,
        ),
    ).toEqual<Paths.Path<typeof Paths.PathBases.Absolute>>({
        path: "S:/Git/PortalRevolution2/content/revolution/materialsrc/lity.png",
        base: Paths.PathBases.Absolute,
    });
});

test("Transform root relative to game material - top level", () => {
    expect(
        Paths.transformPathBase(
            Paths.createPath("game/revolution/materials/lity.vtf", Paths.PathBases.RootRelative),
            Paths.PathBases.GameMaterial,
            testConfig,
        ),
    ).toEqual<Paths.Path<typeof Paths.PathBases.GameMaterial>>({
        path: "lity.vtf",
        base: Paths.PathBases.GameMaterial,
    });
});

test("Transform root relative to game material - nested", () => {
    expect(
        Paths.transformPathBase(
            Paths.createPath("game/revolution/materials/icons/lg/lity.vtf", Paths.PathBases.RootRelative),
            Paths.PathBases.GameMaterial,
            testConfig,
        ),
    ).toEqual<Paths.Path<typeof Paths.PathBases.GameMaterial>>({
        path: "icons/lg/lity.vtf",
        base: Paths.PathBases.GameMaterial,
    });
});

// ------------ Extension stripping

test("Strip single extension", () => {
    expect(
        Paths.stripExtension(
            Paths.createPath("game/revolution/materials/grass/grassy_grass_01.vtf", Paths.PathBases.RootRelative),
        ),
    ).toEqual<Paths.Path<typeof Paths.PathBases.RootRelative>>({
        path: "game/revolution/materials/grass/grassy_grass_01",
        base: Paths.PathBases.RootRelative,
    });
});

test("Strip extension on path with one more dot", () => {
    expect(
        Paths.stripExtension(
            Paths.createPath("game/revolution/materials/grass/grassy_grass_01.test.vtf", Paths.PathBases.RootRelative),
        ),
    ).toEqual<Paths.Path<typeof Paths.PathBases.RootRelative>>({
        path: "game/revolution/materials/grass/grassy_grass_01.test",
        base: Paths.PathBases.RootRelative,
    });
    expect(
        Paths.stripExtension(
            Paths.createPath("game/revolution/materials/grass/grassy_grass_01.vtf.vtf", Paths.PathBases.RootRelative),
        ),
    ).toEqual<Paths.Path<typeof Paths.PathBases.RootRelative>>({
        path: "game/revolution/materials/grass/grassy_grass_01.vtf",
        base: Paths.PathBases.RootRelative,
    });
});

test("Strip extension on path with multiple dots", () => {
    expect(
        Paths.stripExtension(
            Paths.createPath(
                "game/revolution/materials/grass/grassy_grass_01.test.vtf.test.bla.vtf",
                Paths.PathBases.RootRelative,
            ),
        ),
    ).toEqual<Paths.Path<typeof Paths.PathBases.RootRelative>>({
        path: "game/revolution/materials/grass/grassy_grass_01.test.vtf.test.bla",
        base: Paths.PathBases.RootRelative,
    });
});

test("Strip extension when it doesnt exist", () => {
    const originalPath = Paths.createPath(
        "game/revolution/materials/grass/grassy_grass_01",
        Paths.PathBases.RootRelative,
    );
    expect(Paths.stripExtension(originalPath)).toBe(originalPath); // Intentionally check that it's the exact same object
});

test("Strip extension on dot file", () => {
    expect(
        Paths.stripExtension(
            Paths.createPath("game/revolution/materials/grass/.gitignore", Paths.PathBases.RootRelative),
        ),
    ).toEqual<Paths.Path<typeof Paths.PathBases.RootRelative>>({
        path: "game/revolution/materials/grass", // This is expected behavior for node path extensions
        base: Paths.PathBases.RootRelative,
    });
});
