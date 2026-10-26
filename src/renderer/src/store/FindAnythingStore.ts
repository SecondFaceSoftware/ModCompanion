import { defineStore } from "pinia";
import { useRememberRef } from "~/composables/useRemember.js";

export const useFindAnythingStore = defineStore("find-anything", () => {
    const search = useRememberRef(ref(""), "find-anything-search");

    return { search };
});
