export const timeModule = {
    id: "time",
    name: "Time",
    refreshInterval: 100,

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