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


    private activeModuleIds: string[] = [];
    setActiveModules(moduleIds: string[]) {
        this.activeModuleIds = moduleIds;
    }

    //Notifications
    private notificationQueue: { message: string, durationMs: number }[] = [];
    private activeNotification: string | null = null;
    private notificationTimeout: number | null = null;
    private onStateChangeCallback: (() => void) | null = null;


    register(module: NexusModule) {
        const existingModule = this.modules.find(m => m.id === module.id);
        if (existingModule) { return; }

        /* 
           --- BOOT-TIME CONFLICT CHECKER REMOVED ---
           We are now handling validation dynamically in App.tsx 
           whenever the user switches pages!
        */
        this.modules.push(module);
    }


    start(onStateChange: () => void) {
        this.onStateChangeCallback = onStateChange;

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

            if (!this.activeModuleIds.includes(module.id)) {
                continue;
            }

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


    notify(message: string, durationMs: number = 5000) {
        // Add the new notification to the back of the line
        this.notificationQueue.push({ message, durationMs });
        
        // Attempt to process the queue
        this.processNotificationQueue();
    }

    private processNotificationQueue() {
        // If a notification is already playing on screen, do nothing.
        // (The active notification will call this function again when it finishes)
        if (this.activeNotification !== null) return;

        // If the queue is empty, just force a UI update to clear the bubble and stop
        if (this.notificationQueue.length === 0) {
            if (this.onStateChangeCallback) this.onStateChangeCallback();
            return;
        }

        // Grab the next notification in line
        const nextNotification = this.notificationQueue.shift();
        
        if (nextNotification) {
            this.activeNotification = nextNotification.message;
            
            // Force the UI to show the new bubble
            if (this.onStateChangeCallback) this.onStateChangeCallback();

            // Set the timer to hide this bubble and check for the next one
            this.notificationTimeout = window.setTimeout(() => {
                this.activeNotification = null;
                this.notificationTimeout = null;
                
                // Recursively call this function to play the next notification in line!
                this.processNotificationQueue(); 
            }, nextNotification.durationMs);
        }
    }

    getNotification() {
        return this.activeNotification;
    }

}


export const shell = new NexusShell()