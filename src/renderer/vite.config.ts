import { defineConfig } from "vite";
import { fileURLToPath, URL } from "node:url";
import vue from "@vitejs/plugin-vue";
import ui from "@nuxt/ui/vite";
import uiconfig from "./uiconfig.js";
import monacoEditorEsmPlugin from "vite-plugin-monaco-editor-esm";

// https://vitejs.dev/config
export default defineConfig({
    plugins: [vue(), ui(uiconfig()), monacoEditorEsmPlugin()],
    base: "./",
    root: "src",
    build: {
        outDir: "../../../build/renderer",
        emptyOutDir: true,
        rollupOptions: {
            output: {
                entryFileNames: `index.js`,
                chunkFileNames: `chunks/[name].js`,
                assetFileNames: `assets/[name][extname]`,
            },
        },
    },
    resolve: {
        alias: {
            "~": fileURLToPath(new URL("./src", import.meta.url)),
        },
    },
});
