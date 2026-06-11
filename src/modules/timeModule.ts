import type { LayoutSlot, ModuleSize } from "../shell/shell"

export const timeModule = {
    id: "time",
    name: "Time",
    refreshInterval: 100,
    position: "top-right" as LayoutSlot,
    size: "small" as ModuleSize,

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