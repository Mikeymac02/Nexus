/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ComponentType } from "react";
import { TimeWidget } from "./TimeWidget";
import { WeatherWidget } from './WeatherWidget';

type ModuleState = {
        data: any;
        position: string;
        lastUpdated: number;
};

type WidgetProps = {
    state: ModuleState;
};



export const widgetRegistry: Record<string, ComponentType<WidgetProps>> = {
    time: TimeWidget,
    weather: WeatherWidget,
};