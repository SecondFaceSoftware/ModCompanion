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
            Paths.createPath("game/revolution/scripts/test.txt", Paths.PathBases.Root),
            Paths.PathBases.Game,
            testConfig,
        ),
    ).toEqual<Paths.Path>({
        path: "scripts/test.txt",
        base: Paths.PathBases.Game,
    });
});

test("Transform root relative to content relative", () => {
    expect(
        Paths.transformPathBase(
            Paths.createPath("content/revolution/materialsrc/lity.png", Paths.PathBases.Root),
            Paths.PathBases.Content,
            testConfig,
        ),
    ).toEqual<Paths.Path>({
        path: "materialsrc/lity.png",
        base: Paths.PathBases.Content,
    });
});

test("Transform root relative to absolute", () => {
    expect(
        Paths.transformPathBase(
            Paths.createPath("content/revolution/materialsrc/lity.png", Paths.PathBases.Root),
            Paths.PathBases.Absolute,
            testConfig,
        ),
    ).toEqual<Paths.Path>({
        path: "S:/Git/PortalRevolution2/content/revolution/materialsrc/lity.png",
        base: Paths.PathBases.Absolute,
    });
});

test("Transform root relative to game material - top level", () => {
    expect(
        Paths.transformPathBase(
            Paths.createPath("game/revolution/materials/lity.vtf", Paths.PathBases.Root),
            Paths.PathBases.GameMaterial,
            testConfig,
        ),
    ).toEqual<Paths.Path>({
        path: "lity.vtf",
        base: Paths.PathBases.GameMaterial,
    });
});

test("Transform root relative to game material - nested", () => {
    expect(
        Paths.transformPathBase(
            Paths.createPath("game/revolution/materials/icons/lg/lity.vtf", Paths.PathBases.Root),
            Paths.PathBases.GameMaterial,
            testConfig,
        ),
    ).toEqual<Paths.Path>({
        path: "icons/lg/lity.vtf",
        base: Paths.PathBases.GameMaterial,
    });
});

// ------------ Extension stripping

test("Strip single extension", () => {
    expect(
        Paths.stripExtension(
            Paths.createPath("game/revolution/materials/grass/grassy_grass_01.vtf", Paths.PathBases.Root),
        ),
    ).toEqual<Paths.Path>({
        path: "game/revolution/materials/grass/grassy_grass_01",
        base: Paths.PathBases.Root,
    });
});

test("Strip extension on path with one more dot", () => {
    expect(
        Paths.stripExtension(
            Paths.createPath("game/revolution/materials/grass/grassy_grass_01.test.vtf", Paths.PathBases.Root),
        ),
    ).toEqual<Paths.Path>({
        path: "game/revolution/materials/grass/grassy_grass_01.test",
        base: Paths.PathBases.Root,
    });
    expect(
        Paths.stripExtension(
            Paths.createPath("game/revolution/materials/grass/grassy_grass_01.vtf.vtf", Paths.PathBases.Root),
        ),
    ).toEqual<Paths.Path>({
        path: "game/revolution/materials/grass/grassy_grass_01.vtf",
        base: Paths.PathBases.Root,
    });
});

test("Strip extension on path with multiple dots", () => {
    expect(
        Paths.stripExtension(
            Paths.createPath(
                "game/revolution/materials/grass/grassy_grass_01.test.vtf.test.bla.vtf",
                Paths.PathBases.Root,
            ),
        ),
    ).toEqual<Paths.Path>({
        path: "game/revolution/materials/grass/grassy_grass_01.test.vtf.test.bla",
        base: Paths.PathBases.Root,
    });
});

test("Strip extension when it doesnt exist", () => {
    const originalPath = Paths.createPath("game/revolution/materials/grass/grassy_grass_01", Paths.PathBases.Root);
    expect(Paths.stripExtension(originalPath)).toBe(originalPath); // Intentionally check that it's the exact same object
});

test("Strip extension on dot file", () => {
    expect(
        Paths.stripExtension(Paths.createPath("game/revolution/materials/grass/.gitignore", Paths.PathBases.Root)),
    ).toEqual<Paths.Path>({
        path: "game/revolution/materials/grass", // This is expected behavior for node path extensions
        base: Paths.PathBases.Root,
    });
});
