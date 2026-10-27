/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import type { LayoutSlot } from "./shell/shell";
import { shell, ModuleState } from './shell/shell';
import { modules } from "./modules/moduleRegistry";
import { widgetRegistry } from "./widgets/widgetRegistry";
import { backgrounds } from "./backgrounds/backgroundRegistry";

type ShellState = Record<string, ModuleState>;

function App() {
  // 1. All hooks at top level
  const [, setTick] = useState(0);
  const [dynamicBgId, setDynamicBgId] = useState<string | null>(null);
  const [config, setConfig] = useState<any>(null);

  // Fetch initial config from backend port 4000
  useEffect(() => {
    const backendUrl = `http://${window.location.hostname}:4000/api/config`;
    fetch(backendUrl)
      .then(res => res.json())
      .then(data => setConfig(data))
      .catch(err => console.error("Failed to load config", err));
  }, []);

  useEffect(() => {
    modules.forEach((module) => shell.register(module));
    shell.start(() => {
      setTick((t) => t + 1);
    });
    return () => {
      shell.stop();
    };
  }, []);

  // Automation Engine with browser-safe timer types
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    let initialTimer: ReturnType<typeof setTimeout>;

    if (config?.backgroundMode === "slideshow") {
      const photos = backgrounds.filter(bg => bg.type === "photo");
      let i = 0;

      initialTimer = setTimeout(() => {
        setDynamicBgId(photos[i].id);
      }, 0);

      interval = setInterval(() => {
        i = (i + 1) % photos.length;
        setDynamicBgId(photos[i].id);
      }, 60000);

      return () => {
        clearTimeout(initialTimer);
        clearInterval(interval);
      };

    } else if (config?.backgroundMode === "time") {
      const checkTime = () => {
        const hour = new Date().getHours();
        setDynamicBgId(hour >= 6 && hour < 18 ? "blue-gradient" : "dark-gradient");
      };

      initialTimer = setTimeout(checkTime, 0);
      interval = setInterval(checkTime, 60000);

      return () => {
        clearTimeout(initialTimer);
        clearInterval(initialTimer);
      };

    } else {
      setDynamicBgId(null);
    }
  }, [config?.backgroundMode]);

  const state = shell.getState() as ShellState;

  const activeBgId = dynamicBgId || config?.activeBackground || "dark-gradient";
  const currentBackground = backgrounds.find(bg => bg.id === activeBgId) || backgrounds[0];

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
      "hidden": { column: 0, row: 0 }
    };
    return positions[position];
  };

  const getGridPlacement = (moduleState: ModuleState) => {
    if (moduleState.size === "medium") {
      return { columnSpan: 2, rowSpan: 1 };
    } if (moduleState.size === "large") {
      return { columnSpan: 2, rowSpan: 2 };
    } if (moduleState.size === "tall") {
      return { columnSpan: 1, rowSpan: 2 };
    }
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
      if (moduleState.position === "bottom-bar" || moduleState.position === "hidden") { 
        return null; 
      }
      
      const ModuleComponent = widgetRegistry[moduleId];
      if (!ModuleComponent) return null;

      const gridPosition = getGridPosition(moduleState.position);
      if (!gridPosition) return null;

      const gridPlacement = getGridPlacement(moduleState);
      const isFrosted = config?.frostedBubbles !== false;

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
            padding: "20px",
            boxSizing: "border-box",
            backgroundColor: isFrosted ? "rgba(15, 15, 20, 0.5)" : "transparent",
            backdropFilter: isFrosted ? "blur(12px)" : "none",
            WebkitBackdropFilter: isFrosted ? "blur(12px)" : "none",
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
          backgroundColor: currentBackground.type === "solid" ? currentBackground.value : "#000",
          backgroundImage: 
            currentBackground.type === "photo" 
              ? `url(${currentBackground.value})` 
              : currentBackground.type === "gradient"
              ? currentBackground.value
              : "none",
          backgroundSize: "cover",
          backgroundPosition: "center",
          transition: "all 1s ease-in-out",
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
        <div
          style={{
            gridColumn: "1 / 4",
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
