const fs = require("fs-extra");
const path = require("path");

const output = "../deploy";

async function deploy() {
    const steps = [_deployApp, _deployRuntimeWindows, _deployRuntimeLinux];
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

    await fs.ensureDir(appOutputPath);
    await fs.copy(appSrcPath, appOutputPath);
    console.log("✅ Deployed to app");
}

async function _deployRuntimeWindows() {
    const runtimeSrcPath = path.resolve(__dirname, "../prod_runtime/out/mod_companion-win32-x64");
    const runtimeOutputPath = path.resolve(__dirname, `${output}/electron_runtime_win64`);
    await fs.ensureDir(runtimeOutputPath);
    await fs.copy(runtimeSrcPath, runtimeOutputPath);
    console.log("✅ Deployed windows runtime");
}

async function _deployRuntimeLinux() {
    const runtimeSrcPath = path.resolve(__dirname, "../prod_runtime/out/mod_companion-linux-x64");
    const runtimeOutputPath = path.resolve(__dirname, `${output}/electron_runtime_linux64`);
    await fs.ensureDir(runtimeOutputPath);
    await fs.copy(runtimeSrcPath, runtimeOutputPath);
    console.log("✅ Deployed linux runtime");
}

deploy();
