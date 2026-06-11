import type { LayoutSlot, ModuleSize } from "../shell/shell" //This imports the type for the position data that is returned

export const calendarModule = {
    id: "calendar",                          //How your module is identified and catalogued by the shell
    name: "Calendar",                        //Name of your module
    refreshInterval: 60000,                  //How often your module refreshes data (Currently set to 1 second aka 1000ms)
    position: "middle-left" as LayoutSlot,    //Position option chosen as listed in LayoutSlot
    size: "large" as ModuleSize,      

    //Everything here will only run during initialization

    async update() {
        //Everything inside this function will run during each refresh as listed in refreshInterval
        return {
            data: {
                day: new Date().toLocaleDateString([], {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                }),
                events: [
                    {
                        time: "9:00am",
                        title: "team meeting",
                    },
                    {
                        time: "1:30pm",
                        title: "evaluation",
                    }
                ],
            },
        };
    },
};