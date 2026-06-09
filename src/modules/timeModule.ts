import type { LayoutSlot } from "../shell/shell"

export const timeModule = {
    id: "time",
    name: "Time",
    refreshInterval: 100,
    position: "top-left" as LayoutSlot,
    //size: "small",

    async update() {
        return {
            data: {
                now: new Date().toLocaleTimeString([], {
                    hour: "numeric",
                    minute: "2-digit",
                }),
            },
        };
    },
};






/*
export const timeModule = {
    id: "time",
    name: "Time",

    update: async () => {
        return {
            data: {
                now: new Date().toLocaleTimeString([], {
                    hour: "numeric",
                    minute: "2-digit",
                }),
            },
            lastUpdated: Date.now(),
            displayType: "widget",
            position: "top-left",
        };
    },
};
*/