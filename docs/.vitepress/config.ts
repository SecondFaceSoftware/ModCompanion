import { defineConfig } from "vitepress";

// https://vitepress.dev/reference/site-config
export default defineConfig({
    title: "Mod Companion",
    description: "Modder's best friend <3",
    themeConfig: {
        // https://vitepress.dev/reference/default-theme-config
        nav: [
            { text: "Home", link: "/" },
            { text: "User Guide", link: "/user-guide" },
            { text: "Programmer Reference", link: "/programmer-reference" },
        ],

        sidebar: [
            {
                text: "User Guide",
                items: [
                    { text: "User Guide", link: "/user-guide" },
                    { text: "Getting Started", link: "/user-guide/getting-started" },
                ],
            },
            {
                text: "Programmer Reference",
                items: [{ text: "Path Bases", link: "/programmer-reference/path-bases" }],
            },
        ],

        socialLinks: [{ icon: "github", link: "https://github.com/SecondFaceSoftware/ModCompanion" }],
    },
});
