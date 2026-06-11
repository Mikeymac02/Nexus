import type { LayoutSlot, ModuleSize } from "../shell/shell" //This imports the type for the position data that is returned

export const exampleModule = {
    id: "example",                          //How your module is identified and catalogued by the shell
    name: "Example",                        //Name of your module
    refreshInterval: 1000,                  //How often your module refreshes data (Currently set to 1 second aka 1000ms)
    position: "top-right" as LayoutSlot,    //Position option chosen as listed in LayoutSlot
    size: "small" as ModuleSize,              

    //Everything here will only run during initialization

    async update() {
        //Everything inside this function will run during each refresh as listed in refreshInterval
        return {
            data: {
                //Export your data here
            },
        };
    },
};