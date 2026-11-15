import { defineConfig } from "vitepress";

// https://vitepress.dev/reference/site-config
export default defineConfig({
    title: "Mod Companion",
    description: "Modder's best friend <3",
    head: [["link", { rel: "icon", href: "/img/lity_48x48.png" }]],
    themeConfig: {
        // https://vitepress.dev/reference/default-theme-config
        nav: [
            { text: "Home", link: "/" },
            { text: "User Guide", link: "/user-guide" },
        ],

        logo: "/img/lity_48x48.png",
        search: {
            provider: "local",
        },

        outline: [2, 3],

        sidebar: [
            {
                text: "User Guide",
                items: [
                    { text: "What is Mod Companion?", link: "/user-guide" },
                    { text: "Getting Started", link: "/user-guide/getting-started" },
                    { text: "Asset Conversion", link: "/user-guide/asset-conversion" },
                    { text: "Asset Hot Reloading", link: "/user-guide/asset-hot-reloading" },
                    { text: "Game Interop", link: "/user-guide/game-interop" },
                    { text: "MCA Files", link: "/user-guide/mca-files" },
                ],
            },
            {
                text: "Other",
                items: [{ text: "Uty-Lity: Mod Companion's Mascot", link: "/other/mascot-utylity" }],
            },
        ],

        socialLinks: [{ icon: "github", link: "https://github.com/SecondFaceSoftware/ModCompanion" }],
    },
});
