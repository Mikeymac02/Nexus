//import { NexusModule } from './types';
/* eslint-disable @typescript-eslint/no-explicit-any */
import { backgrounds } from '../backgrounds/backgroundRegistry';

export type LayoutSlot = 
    | "top-left"
    | "top-middle"
    | "top-right"
    | "middle-left"
    | "middle"
    | "middle-right"
    | "bottom-left"
    | "bottom-middle"
    | "bottom-right"
    | "bottom-bar";

    
export type ModuleSize =
    | "small"   //1 Wide, 1 tall
    | "medium"  //2 Wide, 1 tall
    | "large"   //2 Wide, 2 tall
    | "tall";   //1 Wide, 2 tall 

export type SizeDefinition = {
    width: number;
    height: number;
}

const slotGrid: LayoutSlot[][] = [
    ["top-left", "top-middle", "top-right"],
    ["middle-left", "middle", "middle-right"],
    ["bottom-left", "bottom-middle", "bottom-right"]
];


function getSlotCoordinates(slot: LayoutSlot) {
    for (let row = 0; row < slotGrid.length; row++) {
        for (let col = 0; col < slotGrid[row].length; col++) {
            if (slotGrid[row][col] === slot) {
                return { row, col };
            }
        }
    }
    return null;
}


export function getOccupiedSlots(position: LayoutSlot, size: ModuleSize): LayoutSlot[] {
    const start = getSlotCoordinates(position);

    if (!start) { return []; }

    const definition = sizeDefinitions[size];
    const occupiedSlots: LayoutSlot[] = [];

    for (let rowOffset = 0; rowOffset < definition.height; rowOffset++) {
        for (let colOffset = 0; colOffset < definition.width; colOffset++) {
            const row = start.row + rowOffset;
            const col = start.col + colOffset;

            const slot = slotGrid[row]?.[col];
            if (slot) {
                occupiedSlots.push(slot);
            }
        }
    }
    return occupiedSlots;
}


export const sizeDefinitions: Record<ModuleSize, SizeDefinition> = {
    small: { width: 1, height: 1 },
    medium: { width: 2, height: 1 },
    large: { width: 2, height: 2 },
    tall: { width: 1, height: 2 },
};


export type ModuleUpdateResult = {
    data: any;
};


export type ModuleState = {
    data: any;
    position: LayoutSlot;
    lastUpdated: number;
    size: ModuleSize;
};


type NexusModule = {
    id: string;
    refreshInterval: number;
    update: () => Promise<ModuleUpdateResult>;
    position: LayoutSlot;
    size: ModuleSize;
};


class NexusShell {
    private modules: NexusModule[] = [];
    private lastRunTimes: Record<string, number> = {};

    state: Record<string, ModuleState> = {};

    private activeBackgroundId = "space";
    private updateTimer: number | null = null;

    register(module: NexusModule) {
        const existingModule = this.modules.find(m => m.id === module.id);
        if (existingModule) { return; }

        const newOccupiedSlots = getOccupiedSlots(module.position, module.size);

        const conflict = this.modules.find(existing => {
            const existingOccupiedSlots = getOccupiedSlots(existing.position, existing.size);
            return existingOccupiedSlots.some(slot => newOccupiedSlots.includes(slot));
        });

        if (conflict) {
            throw new Error(`For module "${module.id}", position "${module.position}" with size "${module.size}" conflicts with existing module "${conflict.id}" at position "${conflict.position}" with size "${conflict.size}".`);
        }
        this.modules.push(module);
    }


    start(onStateChange: () => void) {
        if (this.updateTimer !== null) {
            return;
        }

        const runUpdate = async () => {
            await this.update();
            onStateChange();
        };

        runUpdate();
        this.updateTimer = window.setInterval(runUpdate, 1000);
    }

    stop() {
        if (this.updateTimer !== null) {
            clearInterval(this.updateTimer);
            this.updateTimer = null;
        }
    }

    async update() {
        const now = Date.now()

        for (const module of this.modules) {
            const lastRun = this.lastRunTimes[module.id] ?? 0;
            const elapsed = now - lastRun;
            const isDue = elapsed >= module.refreshInterval;
            if (!isDue) {
                continue;
            }

            try{
                const result = await module.update();
                this.state[module.id] = {
                    data: result.data,
                    position: module.position,
                    lastUpdated: now,
                    size: module.size,
                };

                console.log("STATE:", this.state);
                this.lastRunTimes[module.id] = now
                
            } catch (err) {
                console.error(`Module failed: ${module.id}`, err);
            }      
        }
    }

    getState() {
        return this.state;
    }

    getBackground() {
        return (backgrounds.find(bg => bg.id === this.activeBackgroundId) ?? backgrounds[0]);
    }

    setBackground(id: string) {
        this.activeBackgroundId = id;
    }


}


export const shell = new NexusShell()