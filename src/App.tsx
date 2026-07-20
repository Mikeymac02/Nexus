import { useEffect, useState } from "react";
import type { LayoutSlot, ModuleSize } from "./shell/shell";
import { shell, ModuleState, getOccupiedSlots } from './shell/shell'; 
import { modules } from "./modules/moduleRegistry";
import { widgetRegistry } from "./widgets/widgetRegistry";
import config from "./config.json"; 

type ShellState = Record<string, ModuleState>;

function App() {
    const [, setTick] = useState(0);
    const [activePage, setActivePage] = useState<keyof typeof config.presets>("main"); 

    useEffect(() => {
        modules.forEach((module) => shell.register(module));
        shell.start(() => {
            setTick((t) => t + 1);
        });
        return () => {
            shell.stop();
        };
    }, []);

    useEffect(() => {
        // Grab the module IDs from the current preset (e.g., ["weather", "time", "spotify"])
        const activeModulesOnScreen = Object.keys(config.presets[activePage]);
        
        // Push them to the shell!
        shell.setActiveModules(activeModulesOnScreen);
    }, [activePage]); 


    const state = shell.getState() as ShellState;
    const background = shell.getBackground();

    // The Page Switching & Validation Logic
    const togglePage = () => {
        const pages = Object.keys(config.presets) as (keyof typeof config.presets)[];
        const nextIndex = (pages.indexOf(activePage) + 1) % pages.length;
        const nextPage = pages[nextIndex];

        // On-the-fly Conflict Validation
        const preset = config.presets[nextPage];
        const occupied: string[] = [];
        let hasConflict = false;

        for (const layoutSettings of Object.values(preset)) {
            const slots = getOccupiedSlots(layoutSettings.position as LayoutSlot, layoutSettings.size as ModuleSize);
            for (const slot of slots) {
                if (occupied.includes(slot)) {
                    hasConflict = true;
                    break;
                }
                occupied.push(slot);
            }
            if (hasConflict) break;
        }

        if (hasConflict) {
            // Replaced the notification queue with a console warning for now!
            console.warn(`Error: Overlapping modules detected on the ${nextPage} page!`);
        } else {
            setActivePage(nextPage);
        }
    };

    const getGridPosition = (position: LayoutSlot) => {
        const positions: Record<LayoutSlot, { column: number; row: number }> = {
            "top-left": { column: 1, row: 1 },
            "top-middle": { column: 2, row: 1 },
            "top-right": { column: 3, row: 1 },
            "middle-left": { column: 1, row: 2 },
            "middle": { column: 2, row: 2 },
            "middle-right": { column: 3, row: 2 },
            "bottom-left": { column: 1, row: 3 },
            "bottom-middle": { column: 2, row: 3 },
            "bottom-right": { column: 3, row: 3 },
            "bottom-bar": { column: 1, row: 4 },
        };
        return positions[position];
    }

    const getGridPlacement = (size: ModuleSize) => {
        if (size === "medium") return { columnSpan: 2, rowSpan: 1 };
        if (size === "large") return { columnSpan: 2, rowSpan: 2 };
        if (size === "tall") return { columnSpan: 1, rowSpan: 2 };
        return { columnSpan: 1, rowSpan: 1 };
    };

    const renderSlot = (slot: LayoutSlot) => {
        const currentLayout = config.presets[activePage];
        
        return Object.entries(currentLayout).map(([moduleId, layoutSettings]) => {
            if (layoutSettings.position !== slot) return null;
            
            const ModuleComponent = widgetRegistry[moduleId];
            if (!ModuleComponent) return null;
            
            const moduleState = state[moduleId] || { data: {} }; 
            return <ModuleComponent key={moduleId} state={moduleState} />;
        });
    };

    const renderModules = () => {
        const currentLayout = config.presets[activePage];

        return Object.entries(currentLayout).map(([moduleId, layoutSettings]) => {
            if (layoutSettings.position === "bottom-bar") return null;

            const ModuleComponent = widgetRegistry[moduleId];
            if (!ModuleComponent) return null;

            const gridPosition = getGridPosition(layoutSettings.position as LayoutSlot);
            const gridPlacement = getGridPlacement(layoutSettings.size as ModuleSize);
            const moduleState = state[moduleId] || { data: {} };

            return (
                <div
                    key={moduleId}
                    style={{
                        gridColumnStart: gridPosition.column,
                        gridColumnEnd: `span ${gridPlacement.columnSpan}`,
                        gridRowStart: gridPosition.row,
                        gridRowEnd: `span ${gridPlacement.rowSpan}`,
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        overflow: "hidden",
                        
                        // --- ADD THESE TWO LINES ---
                        padding: "24px", 
                        boxSizing: "border-box", 

                        // --- DIRECTLY INJECTED FROSTED GLASS STYLES ---
                        backgroundColor: "rgba(15, 15, 20, 0.65)", 
                        backdropFilter: "blur(16px)",              
                        WebkitBackdropFilter: "blur(16px)",        
                        borderRadius: "24px",                      
                        border: "1px solid rgba(255, 255, 255, 0.08)", 
                        boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)", 
                    }}
                >
                    <ModuleComponent state={moduleState} />
                </div>
            );
        });
    };

    return (
        <>
            <div
                style={{
                    position: "fixed",
                    inset: 0,
                    zIndex: -1,
                    background:
                        background.type === "gradient"
                            ? background.value
                            : background.type === "solid"
                            ? background.value
                            : `url(${background.value}) center/cover`,
                }}
            />

            <div
                onClick={togglePage} 
                style={{
                    color: "white",
                    width: "100%",
                    padding: "20px",
                    height: "100vh",
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr",
                    gridTemplateRows: "1fr 1fr 1fr 0.4fr",
                    gap: "10px",
                    boxSizing: "border-box",
                    cursor: "pointer",
                }}
            >
                {renderModules()}
                
                {/* Bottom Bar */}
                <div
                    style={{
                        gridColumn: "1 / 4",
                        gridRow: "4", 
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        width: "100%",
                        height: "100%",
                    }}
                >
                    {renderSlot("bottom-bar")}
                </div>
            </div>
        </>
    );
}

export default App;