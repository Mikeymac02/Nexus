/* eslint-disable @typescript-eslint/no-explicit-any */
export type ModulePosition = "top" | "center" | "bottom" | "left" | "right";

export interface ModuleState {
    data: any;
    lastUpdated: number;
    displayType: "widget" | "panel";
    position?: ModulePosition;
}

export interface NexusModule {
    id: string;
    name: string;
    update: () => Promise<ModuleState>;
}