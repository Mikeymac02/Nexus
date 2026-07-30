/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { io } from "socket.io-client"; // NEW: The WebSocket Client
import { backgrounds } from "./backgrounds/backgroundRegistry"; // NEW: To fetch your backgrounds

import type { LayoutSlot } from "./shell/shell";
import { shell, ModuleState } from './shell/shell';
import { modules } from "./modules/moduleRegistry";
import { widgetRegistry } from "./widgets/widgetRegistry";

type ShellState = Record<string, ModuleState>;

function App() {
    const [, setTick] = useState(0);
    
    // NEW: React State to hold our live configuration
    const [config, setConfig] = useState<any>({ 
        activeBackground: "dark-gradient", 
        activePage: "main",
        presets: { main: {}, media: {} }
    });

    useEffect(() => {
        // 1. INITIAL LOAD: Fetch the saved config so it survives reboots
        fetch("http://localhost:4000/api/config", { cache: "no-store" })
            .then(res => res.json())
            .then(data => {
                console.log("INITIAL CONFIG LOAD:", data);
                setConfig(data);
            })
            .catch(err => console.error("Failed to fetch config:", err));

        // 2. LIVE BRIDGE: Connect the WebSocket to the Node Server
        const socket = io("http://localhost:4000");
        
        socket.on("connect", () => console.log("Connected to Nexus Remote Server!"));
        
        // 3. LISTEN: When the phone taps a button, instantly update React State
        socket.on("config_updated", (newConfig) => {
            console.log("LIVE UPDATE RECEIVED:", newConfig);
            setConfig(newConfig);
        });

        // 4. ENGINE BOOT: Start the widget shell
        modules.forEach((module) => shell.register(module));
        shell.start(() => {
            setTick((t) => t + 1);
        });

        // CLEANUP
        return () => {
            socket.disconnect();
            shell.stop();
        };
    }, []);

    const state = shell.getState() as ShellState;
    
    // NEW: Find the matching background definition from your registry based on the live config
    const activeBg = backgrounds.find(bg => bg.id === config.activeBackground) || backgrounds[0];

    // 1. Grab the layout dictionary for whichever page the remote currently has active
    const currentLayout = config.presets?.[config.activePage] || config.presets?.main || {};
    
    // 2. Extract just the names (e.g., ["time", "spotify"]) to act as our Gatekeeper
    const allowedModules = Object.keys(currentLayout);
    


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

    const getGridPlacement = (state: ModuleState) => {
        if (state.size === "medium") {
            return { columnSpan: 2, rowSpan: 1 };
        } if (state.size === "large") {
            return { columnSpan: 2, rowSpan: 2 };
        } if (state.size === "tall") {
            return { columnSpan: 1, rowSpan: 2 };
        }
        return { columnSpan: 1, rowSpan: 1 };
    };

    const renderSlot = (slot: LayoutSlot) => {
        return Object.entries(state).map(([moduleId, moduleState]) => {
            if (!allowedModules.includes(moduleId)) return null;
            
            // OVERRIDE: Get the rules from JSON
            const layoutConfig = currentLayout[moduleId];
            if (layoutConfig.position !== slot) return null;

            const ModuleComponent = widgetRegistry[moduleId];
            if (!ModuleComponent) return null;
            
            // Pass the custom size and position down to the widget!
            const overriddenState = { ...moduleState, position: layoutConfig.position, size: layoutConfig.size };

            return <ModuleComponent key={moduleId} state={overriddenState} />;
        });
    };

    const renderModules = () => {
        return Object.entries(state).map(([moduleId, moduleState]) => {
            if (!allowedModules.includes(moduleId)) return null; 

            // OVERRIDE: Get the rules from JSON
            const layoutConfig = currentLayout[moduleId];
            const activePosition = layoutConfig.position;
            const activeSize = layoutConfig.size;

            if (activePosition === "bottom-bar") { return null; }
            
            const ModuleComponent = widgetRegistry[moduleId];
            if (!ModuleComponent) return null;
            
            // Calculate grid math using your JSON rules instead of the defaults
            const gridPosition = getGridPosition(activePosition);
            const gridPlacement = getGridPlacement({ ...moduleState, size: activeSize });
            
            // Inject the new rules into the state so the widget knows how to draw itself
            const overriddenState = { ...moduleState, position: activePosition, size: activeSize };
            
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
                    }}
                >
                    <ModuleComponent state={overriddenState} />
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
                    // NEW: Dynamically render the background based on our live config state
                    background:
                        activeBg.type === "gradient"
                            ? activeBg.value
                            : activeBg.type === "solid"
                            ? activeBg.value
                            : `url(${activeBg.value}) center/cover no-repeat`, // Supports your Space Photo!
                }}
            />
            <div
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
                }}
            >

                {renderModules()}
                {/* Bottom Bar */}
                <div
                    style={{
                        gridColumn: "1 / 4",
                        gridRow: "4", // <-- ADD THIS LINE to anchor it to the absolute bottom!
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                    }}
                >
                    {renderSlot("bottom-bar")}
                </div>
            </div>
        </>
    );
}

export default App;