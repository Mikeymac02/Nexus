/* eslint-disable @typescript-eslint/no-unused-vars */
import { timeModule } from "./timeModule";
import { weatherModule } from './weatherModule';
import { calendarModule } from './calendarModule';
import { spotifyModule } from './spotifyModule';
import { tickerModule } from './tickerModule';
import { newsModule } from './newsModule';

import type { LayoutSlot, ModuleSize } from "../shell/shell";
import config from "../config.json";

// 1. Array of modules
const rawModules = [
  timeModule,
  weatherModule,
  calendarModule,
  spotifyModule,
  //tickerModule,
  newsModule
];

// 2. Map over them and inject the layout properties from config.json
export const modules = rawModules.map((mod) => {
  // Look up this specific module's config from the JSON file
  const settings = config.layout[mod.id as keyof typeof config.layout];

  return {
    ...mod,
    position: (settings?.position || "top-left") as LayoutSlot, // Fallback if missing
    size: (settings?.size || "small") as ModuleSize             // Fallback if missing
  };
});