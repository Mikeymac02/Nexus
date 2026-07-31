/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import type { LayoutSlot } from "./shell/shell";
import { shell, ModuleState } from './shell/shell';
import { modules } from "./modules/moduleRegistry";
import { widgetRegistry } from "./widgets/widgetRegistry";
import { io } from "socket.io-client";

type ShellState = Record<string, ModuleState>;

function App() {
  const [, setTick] = useState(0);
  const [config, setConfig] = useState<any>(null);

  useEffect(() => {
    // 1. Connect to your Node server's WebSocket
    const socket = io('http://localhost:4000');

    // 2. Helper function to instantly apply live changes to the dashboard
    const applyConfigToShell = (data: any) => {
      setConfig(data);
      
      // Inject live API settings safely
      if (typeof (shell as any).setGlobalSettings === 'function') {
         (shell as any).setGlobalSettings(data.moduleSettings || {});
      }

      if (data.activeBackground) {
        shell.setBackground(data.activeBackground);
      }

      if (data.presets && data.presets[data.activePage || "main"]) {
        const layout = data.presets[data.activePage || "main"];
        const currentState = shell.getState(); 

        modules.forEach(mod => {
          if (layout[mod.id]) {
            mod.position = layout[mod.id].position;
            mod.size = layout[mod.id].size;
            if (currentState[mod.id]) {
              currentState[mod.id].position = layout[mod.id].position;
              currentState[mod.id].size = layout[mod.id].size;
            }
          } else {
            // NEW: If the module is NOT in the active layout, banish it to a hidden state
            mod.position = "hidden" as any;
            if (currentState[mod.id]) {
              currentState[mod.id].position = "hidden" as any;
            }
          }
        });
      }
    };

    // 3. Fetch the initial config on boot
    fetch('http://localhost:4000/api/config')
      .then(res => res.json())
      .then(data => {
        applyConfigToShell(data);

        // Scout for default module settings
        const defaultSettingsPayload: Record<string, any> = {};
        modules.forEach((module) => {
          shell.register(module);
          if (module.settings) {
            defaultSettingsPayload[module.id] = module.settings;
          }
        });

        // Silently sync default settings with the Node server
        fetch('http://localhost:4000/api/sync-settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(defaultSettingsPayload)
        }).catch(err => console.error("Failed to sync settings with server", err));

        // Start the dashboard timer
        shell.start(() => {
          setTick((t) => t + 1);
        });
      })
      .catch(err => console.error("Failed to load config", err));

    // 4. LISTEN FOR LIVE UPDATES FROM THE PHONE
    socket.on('config_updated', (newConfig) => {
      console.log("Live update received from Admin Panel!");
      applyConfigToShell(newConfig);
      
      // Force React to instantly re-render the screen to reflect the new layout
      setTick((t) => t + 1);
    });

    return () => {
      shell.stop();
      socket.disconnect(); // Clean up the connection on close
    };
  }, []);

  if (!config) {
    return <div style={{ color: "white", padding: "20px" }}>Loading Nexus...</div>;
  }

  const state = shell.getState() as ShellState;
  const background = shell.getBackground();

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
      "hidden": { column: 0, row: 0 } // <--- ADD THIS LINE
    };
    return positions[position];
  }

  const getGridPlacement = (state: ModuleState) => {
    if (state.size === "medium") return { columnSpan: 2, rowSpan: 1 };
    if (state.size === "large") return { columnSpan: 2, rowSpan: 2 };
    if (state.size === "tall") return { columnSpan: 1, rowSpan: 2 };
    return { columnSpan: 1, rowSpan: 1 };
  };

  const renderSlot = (slot: LayoutSlot) => {
    return Object.entries(state).map(([moduleId, moduleState]) => {
      if (moduleState.position !== slot) return null;
      const ModuleComponent = widgetRegistry[moduleId];
      if (!ModuleComponent) return null;
      return <ModuleComponent key={moduleId} state={moduleState} />;
    });
  };

  const renderModules = () => {
    return Object.entries(state).map(([moduleId, moduleState]) => {
      if (moduleState.position === "bottom-bar" || moduleState.position === "hidden") return null;
      
      const ModuleComponent = widgetRegistry[moduleId];
      if (!ModuleComponent) return null;

      const gridPosition = getGridPosition(moduleState.position);
      if (!gridPosition) return null; 

      const gridPlacement = getGridPlacement(moduleState);
      
      // NEW: Check the live config state, default to true!
      const isFrosted = config.frostedBubbles !== false;

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
            transition: "all 0.4s ease-in-out",
            
            // --- NEW: DYNAMIC FROSTED BUBBLES ---
            backgroundColor: isFrosted ? "rgba(15, 15, 20, 0.5)" : "transparent",
            backdropFilter: isFrosted ? "blur(12px)" : "none",
            WebkitBackdropFilter: isFrosted ? "blur(12px)" : "none", // Safari support
            borderRadius: isFrosted ? "24px" : "0px",
            boxShadow: isFrosted ? "0 8px 32px rgba(0, 0, 0, 0.2)" : "none",
            border: isFrosted ? "1px solid rgba(255, 255, 255, 0.05)" : "none",
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
          // 1. Use backgroundColor exclusively for solid colors
          backgroundColor: background.type === "solid" ? background.value : "#000",
          
          // 2. Use backgroundImage for BOTH photos and gradients!
          backgroundImage: 
            background.type === "photo" 
              ? `url(${background.value})` 
              : background.type === "gradient"
              ? background.value
              : "none",
              
          // 3. These will now stay locked in permanently
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          transition: "all 0.5s ease" 
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
            gridRow: "4", // <--- ADD THIS EXACT LINE
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