const fsExtra = require("fs-extra");
const fs = require("fs/promises");
const path = require("path");

const output = "../deploy";

async function deploy() {
    const steps = [_deployApp, _deployRuntimeWindows, _deployRuntimeLinux, _createPackageJson];
    for (const step of steps) {
        try {
            await step();
        } catch (e) {
            console.warn(e);
        }
    }
    console.log("DEPLOY DONE!");
}

async function _deployApp() {
    const appSrcPath = path.resolve(__dirname, "../build");
    const appOutputPath = path.resolve(__dirname, `${output}/app/build`);

    await fsExtra.ensureDir(appOutputPath);
    await fsExtra.copy(appSrcPath, appOutputPath);
    console.log("✅ Deployed to app");
}

async function _deployRuntimeWindows() {
    const runtimeSrcPath = path.resolve(__dirname, "../prod_runtime/out/mod_companion-win32-x64");
    const runtimeOutputPath = path.resolve(__dirname, `${output}/electron_runtime_win64`);
    await fsExtra.ensureDir(runtimeOutputPath);
    await fsExtra.copy(runtimeSrcPath, runtimeOutputPath);
    console.log("✅ Deployed windows runtime");
}

async function _deployRuntimeLinux() {
    const runtimeSrcPath = path.resolve(__dirname, "../prod_runtime/out/mod_companion-linux-x64");
    const runtimeOutputPath = path.resolve(__dirname, `${output}/electron_runtime_linux64`);
    await fsExtra.ensureDir(runtimeOutputPath);
    await fsExtra.copy(runtimeSrcPath, runtimeOutputPath);
    console.log("✅ Deployed linux runtime");
}

async function _createPackageJson() {
    const packageJsonPath = path.resolve(__dirname, `${output}/app/package.json`);
    const version = await fs.readFile(path.resolve(__dirname, "../version.txt"), "utf-8");
    const packageJsonContent = {
        name: "mod_companion",
        productName: "Mod Companion",
        version,
        main: "build/main/main.cjs",
        author: "Second Face Software",
    };
    const packageJsonContentStringified = JSON.stringify(packageJsonContent, null, 4);

    await fs.writeFile(packageJsonPath, packageJsonContentStringified);
}

deploy();
