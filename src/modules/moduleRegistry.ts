/* eslint-disable @typescript-eslint/no-explicit-any */
import type { LayoutSlot, ModuleSize } from "../shell/shell";
import { timeModule } from "./timeModule";
import { weatherModule } from './weatherModule';
import { calendarModule } from './calendarModule';
import { spotifyModule } from './spotifyModule';
import { newsModule } from './newsModule';

import config from "../config.json"; // Keep your config import!

// 1. Put your modules in a base array
const baseModules = [
    timeModule,
    weatherModule,
    calendarModule,
    spotifyModule,
    newsModule
];

// 2. Map over them and inject the positions from your config file, just like you had before!
export const modules = baseModules.map((module) => {
    // Read from the new "presets.main" path
    const settings = (config.presets.main as any)[module.id];

    // We guarantee a position and size are returned so TypeScript doesn't panic
    return {
        ...module,
        position: (settings?.position || (module as any).position || "top-left") as LayoutSlot,
        size: (settings?.size || (module as any).size || "small") as ModuleSize,
    };
});