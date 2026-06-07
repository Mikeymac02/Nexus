//import { NexusModule } from './types';
/* eslint-disable @typescript-eslint/no-explicit-any */

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
    | "small"
    | "medium"
    | "large";


export type ModuleUpdateResult = {
    data: any;
};

export type ModuleState = {
    data: any;
    position: LayoutSlot;
    lastUpdated: number;
};

type NexusModule = {
    id: string;
    refreshInterval: number;
    update: () => Promise<ModuleUpdateResult>;
    position: LayoutSlot;
    //size: ModuleSize;
};

class NexusShell {
    private modules: NexusModule[] = [];

    private lastRunTimes: Record<string, number> = {};

    state: Record<string, ModuleState> = {};

    private updateTimer: number | null = null;

    register(module: NexusModule) {

        const existingModule = this.modules.find(m => m.id === module.id);
        if (existingModule) { return; }

        const posConflict = this.modules.find( existing => existing.position === module.position);
        if (posConflict) {
            throw new Error(`For module "${module.id}", Slot "${module.position}" is already occupied by "${posConflict.id}"`);
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
                };

                //console.log("STATE:", this.state);
                this.lastRunTimes[module.id] = now
                
            } catch (err) {
                console.error(`Module failed: ${module.id}`, err);
            }      
        }
    }

    getState() {
        return this.state;
    }
}

export const shell = new NexusShell()