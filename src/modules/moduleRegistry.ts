/* eslint-disable @typescript-eslint/no-explicit-any */
import type { LayoutSlot, ModuleSize, NexusModule } from "../shell/shell"; 
import { timeModule } from "./timeModule";
import { weatherModule } from './weatherModule';
import { calendarModule } from './calendarModule';
import { spotifyModule } from './spotifyModule';
import { newsModule } from './newsModule';

import config from "../config.json"; 

// 1. Create a flexible type for modules BEFORE they get their layout assigned
type BaseModule = Omit<NexusModule, "position" | "size"> & {
    position?: LayoutSlot;
    size?: ModuleSize;
};

// 2. Apply this flexible type to the base array
const baseModules: BaseModule[] = [
    timeModule,
    weatherModule,
    calendarModule,
    spotifyModule,
    newsModule
];

// 3. Map over them and explicitly tell TypeScript we are returning strict NexusModules
export const modules: NexusModule[] = baseModules.map((module) => {
    // Read from the new "presets.main" path
    const settings = (config.presets.main as any)[module.id];

    // We guarantee a position and size are returned so TypeScript is happy
    return {
        ...module,
        position: (settings?.position || module.position || "top-left") as LayoutSlot,
        size: (settings?.size || module.size || "small") as ModuleSize,
    };
});