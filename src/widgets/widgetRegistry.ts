/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ComponentType } from "react";
// 1. Import the official ModuleState from your shell
import type { ModuleState } from "../shell/shell";

import { TimeWidget } from "./TimeWidget";
import { WeatherWidget } from './WeatherWidget';
import { CalendarWidget } from './CalendarWidget';
import { TickerWidget } from './TickerWidget';
import { SpotifyWidget } from './SpotifyWidget';
import { NewsWidget } from './NewsWidget';

// 2. We removed the locally defined ModuleState block that used to be here!

type WidgetProps = {
    // 3. This now uses the imported shell state, which correctly includes 'size'
    state: ModuleState; 
};

// 4. Set ComponentType to <any> to prevent strict React prop-mapping errors
export const widgetRegistry: Record<string, ComponentType<any>> = {
    time: TimeWidget,
    weather: WeatherWidget,
    calendar: CalendarWidget,
    //ticker: TickerWidget,
    spotify: SpotifyWidget,
    news: NewsWidget
};