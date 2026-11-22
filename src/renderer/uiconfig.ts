import { NuxtUIOptions } from "@nuxt/ui/vite";

export default function buildConfig(): NuxtUIOptions {
    return {
        components: {
            dts: "./components.d.ts",
            dirs: ["./components"],
            extensions: ["vue"],
            deep: true,
        },
        autoImport: {
            vueDirectives: true,
            vueTemplate: true,
            dts: "./auto-imports.d.ts",
            imports: ["vue"],
        },
        ui: {
            colorMode: false,
            colors: {
                primary: "magenta",
            },
            badge: {
                slots: {
                    base: "select-none",
                },
                compoundVariants: [
                    {
                        color: "success",
                        variant: "label",
                        class: "bg-none text-success",
                    },
                    {
                        color: "error",
                        variant: "label",
                        class: "bg-none text-error",
                    },
                    {
                        color: "info",
                        variant: "label",
                        class: "bg-none text-info",
                    },
                ],
            },
            button: {
                slots: {
                    base: "cursor-pointer select-none",
                },
                variants: {
                    variant: {
                        solid: "inset-shadow-rim",
                        cave: "bg-neutral-900 hover:bg-neutral-850 inset-shadow-cave shadow-neutral-950 ring-transparent border border-accented outline-primary-500 outline-2 outline-none focus-visible:outline-solid focus-visible:outline-groove",
                    },
                },
                compoundVariants: [
                    {
                        color: "neutral",
                        variant: "solid",
                        class: "bg-neutral-800 hover:bg-neutral-750 active:bg-neutral-850 disabled:bg-neutral-800 text-neutral-100 shadow-xs shadow-neutral-950/50 disabled:text-neutral-600",
                    },
                ],
                defaultVariants: {
                    color: "neutral",
                    variant: "solid",
                    size: "md",
                },
            },
            select: {
                slots: {
                    base: "cursor-pointer",
                    content: "shadow-md inset-shadow-rim shadow-neutral-950",
                },
                variants: {
                    variant: {
                        outline: "hover:bg-elevated active:bg-elevated",
                        lowered:
                            "bg-neutral-900 hover:bg-neutral-850 inset-shadow-cave shadow-neutral-950 ring-transparent border border-accented outline-primary-500 outline-2 outline-none focus-visible:outline-solid",
                    },
                },
                defaultVariants: {
                    color: "primary",
                    variant: "lowered",
                    size: "md",
                },
            },
            popover: {
                slots: {
                    // Above dockview divider lines which are at 99
                    content: "z-200 ring-0 inset-shadow-rim shadow-md shadow-neutral-950",
                },
            },
            contextMenu: {
                slots: {
                    // Above dockview divider lines which are at 99
                    content: "z-200",
                },
            },
            tooltip: {
                slots: {
                    // Above dockview divider lines which are at 99
                    content: "z-200",
                },
            },
            modal: {
                slots: {
                    // Above dockview divider lines which are at 99
                    content: "z-200",
                },
            },
            formField: {
                slots: {
                    root: "p-2 bg-neutral-800 rounded-lg",
                    label: "mx-1",
                },
            },
            input: {
                slots: {
                    base: "",
                },
                variants: {
                    variant: {
                        lowered:
                            "bg-neutral-900 hover:bg-neutral-850 inset-shadow-cave shadow-neutral-950 ring-transparent border border-accented outline-primary-500 outline-2 outline-none focus-visible:outline-solid",
                    },
                },
                defaultVariants: {
                    color: "primary",
                    variant: "lowered",
                    size: "md",
                },
            },
            textarea: {
                slots: {
                    base: "hover:bg-elevated",
                },
                variants: {
                    variant: {
                        lowered:
                            "bg-neutral-900 hover:bg-neutral-850 inset-shadow-cave shadow-neutral-950 ring-transparent border border-accented outline-primary-500 outline-2 outline-none focus-visible:outline-solid",
                    },
                },
                defaultVariants: {
                    color: "primary",
                    variant: "lowered",
                    size: "md",
                },
            },
            inputNumber: {
                variants: {
                    variant: {
                        lowered:
                            "bg-neutral-900 hover:bg-neutral-850 inset-shadow-cave shadow-neutral-950 ring-transparent border border-accented outline-primary-500 outline-2 outline-none focus-visible:outline-solid",
                    },
                },
                defaultVariants: {
                    color: "primary",
                    variant: "lowered",
                    size: "md",
                },
            },
            checkbox: {
                slots: {
                    root: "cursor-pointer select-none transition-colors",
                    base: "cursor-pointer overflow-visible ring-0 inset-shadow-cave border border-accented bg-neutral-900",
                    icon: "cursor-pointer",
                    indicator: "cursor-pointer bg-transparent",
                    label: "cursor-pointer",
                },
                variants: {
                    variant: {
                        card: {
                            root: "hover:bg-elevated",
                        },
                        button: {
                            root: "hover:bg-elevated rounded",
                        },
                    },
                    color: {
                        primary: {
                            icon: "text-primary",
                            indicator: "bg-transparent",
                        },
                        secondary: {
                            icon: "text-secondary",
                            indicator: "bg-transparent",
                        },
                        success: {
                            icon: "text-success",
                            indicator: "bg-transparent",
                        },
                        info: {
                            icon: "text-info",
                            indicator: "bg-transparent",
                        },
                        warning: {
                            icon: "text-warning",
                            indicator: "bg-transparent",
                        },
                        error: {
                            icon: "text-error",
                            indicator: "bg-transparent",
                        },
                        neutral: {
                            icon: "text-neutral-100",
                            indicator: "bg-transparent",
                        },
                    },
                },
                compoundVariants: [
                    {
                        size: "md",
                        variant: "card",
                        class: {
                            root: "p-2",
                        },
                    },
                    {
                        size: "xs",
                        variant: "button",
                        class: {
                            root: "px-2 py-1",
                        },
                    },
                    {
                        size: "sm",
                        variant: "button",
                        class: {
                            root: "px-2.5 py-1.5",
                        },
                    },
                    {
                        size: "md",
                        variant: "button",
                        class: {
                            root: "px-2.5 py-1.5",
                        },
                    },
                    {
                        size: "lg",
                        variant: "button",
                        class: {
                            root: "px-3 py-2",
                        },
                    },
                    {
                        size: "xl",
                        variant: "button",
                        class: {
                            root: "px-3 py-2",
                        },
                    },
                ],
            },
            icons: {
                check: "mingcute:check-2-fill",
            },
            navigationMenu: {
                slots: {
                    // Above dockview divider lines which are at 99
                    content: "z-200",
                    item: "cursor-pointer",
                },
                variants: {
                    orientation: {
                        horizontal: {
                            item: "py-0",
                        },
                    },
                },
            },
        },
    };
}
