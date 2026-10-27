import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import type { LayoutSlot } from "./shell/shell";
import { shell, ModuleState } from "./shell/shell";
import { modules } from "./modules/moduleRegistry";
import { widgetRegistry } from "./widgets/widgetRegistry";
import { backgrounds } from "./backgrounds/backgroundRegistry";

type ShellState = Record<string, ModuleState>;

// Connect socket to Node server on port 4000
const socket = io(`http://${window.location.hostname}:4000`);

function App() {
  const [config, setConfig] = useState<any>(null);
  const [, setTick] = useState(0);

  // 1. Sync with Express Backend & Socket.io Admin Panel
  useEffect(() => {
    // Initial config load from backend
    fetch(`http://${window.location.hostname}:4000/api/config`)
      .then((res) => res.json())
      .then((data) => setConfig(data))
      .catch((err) => console.error("Failed to load config:", err));

    // Listen for live Admin Panel updates
    socket.on("config_updated", (newConfig) => {
      setConfig(newConfig);
      if (newConfig.activeBackground) {
        shell.setBackground(newConfig.activeBackground);
      }
    });

    return () => {
      socket.off("config_updated");
    };
  }, []);

  // 2. Start Modules Engine
  useEffect(() => {
    modules.forEach((module) => shell.register(module));
    shell.start(() => {
      setTick((t) => t + 1);
    });
    return () => {
      shell.stop();
    };
  }, []);

  const state = shell.getState() as ShellState;

  // Active Background Resolution
  const activeBgId = config?.activeBackground || "dark-gradient";
  const currentBg = backgrounds.find((bg) => bg.id === activeBgId) || backgrounds[0];

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
  };

  const getGridPlacement = (size: string, position: LayoutSlot) => {
    if (position === "bottom-bar") {
      return { columnSpan: 3, rowSpan: 1 };
    }
    if (size === "medium") return { columnSpan: 2, rowSpan: 1 };
    if (size === "large") return { columnSpan: 2, rowSpan: 2 };
    if (size === "tall") return { columnSpan: 1, rowSpan: 2 };
    return { columnSpan: 1, rowSpan: 1 };
  };

  const renderSlot = (slot: LayoutSlot) => {
    const activePage = config?.activePage || "default";
    const activeLayout = config?.presets?.[activePage] || {};

    return Object.entries(state).map(([moduleId, moduleState]) => {
      const layoutInfo = activeLayout[moduleId];
      const position = (layoutInfo?.position || moduleState.position) as LayoutSlot;
      const size = layoutInfo?.size || moduleState.size;

      if (position !== slot) return null;
      const ModuleComponent = widgetRegistry[moduleId];
      if (!ModuleComponent) return null;

      // Pass the effective merged state down so widgets know their resized state
      const effectiveState: ModuleState = {
        ...moduleState,
        position,
        size,
      };

      return <ModuleComponent key={moduleId} state={effectiveState} />;
    });
  };

  const renderModules = () => {
    const activePage = config?.activePage || "default";
    const activeLayout = config?.presets?.[activePage] || {};

    return Object.entries(state).map(([moduleId, moduleState]) => {
      const layoutInfo = activeLayout[moduleId];

      // Override position and size from the active preset in config.json
      const position = (layoutInfo?.position || moduleState.position) as LayoutSlot;
      const size = layoutInfo?.size || moduleState.size;

      if (position === "bottom-bar" || position === "hidden") return null;

      const ModuleComponent = widgetRegistry[moduleId];
      if (!ModuleComponent) return null;

      const gridPosition = getGridPosition(position);
      if (!gridPosition) return null;

      const gridPlacement = getGridPlacement(size, position);
      const isFrosted = config?.frostedBubbles !== false;

      // Construct effective state so widget components receive the updated size prop
      const effectiveState: ModuleState = {
        ...moduleState,
        position,
        size,
      };

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
            padding: "20px",
            boxSizing: "border-box",
            backgroundColor: isFrosted ? "rgba(15, 15, 20, 0.5)" : "transparent",
            backdropFilter: isFrosted ? "blur(12px)" : "none",
            WebkitBackdropFilter: isFrosted ? "blur(12px)" : "none",
            borderRadius: isFrosted ? "24px" : "0px",
            boxShadow: isFrosted ? "0 8px 32px rgba(0, 0, 0, 0.2)" : "none",
            border: isFrosted ? "1px solid rgba(255, 255, 255, 0.05)" : "none",
            transition: "all 0.4s ease-in-out",
          }}
        >
          <ModuleComponent state={effectiveState} />
        </div>
      );
    });
  };

  // Construct background CSS value for gradients, solids, and photo URLs
  const getBackgroundCss = () => {
    if (!currentBg) return "#1a1a1a";
    if (currentBg.type === "photo") {
      return `url(${currentBg.value}) center/cover no-repeat`;
    }
    return currentBg.value;
  };

  return (
    <>
      {/* Background layer */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: -1,
          background: getBackgroundCss(),
          transition: "background 0.5s ease-in-out",
        }}
      />

      {/* Main Grid Layout */}
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

        {/* Bottom Bar: Explicitly anchored to Row 4 */}
        <div
          style={{
            gridColumn: "1 / 4",
            gridRow: "4 / 5",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: "10px",
            boxSizing: "border-box",
          }}
        >
          {renderSlot("bottom-bar")}
        </div>
      </div>
    </>
  );
}

export default App;
