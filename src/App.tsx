/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";

import type { LayoutSlot } from "./shell/shell";
import { shell} from "./shell/shell";
import { modules } from "./modules/moduleRegistry";
import { widgetRegistry } from "./widgets/widgetRegistry";

type ModuleState = {
  data: any;
  position: LayoutSlot;
  lastUpdated: number;
};

type ShellState = Record<string, ModuleState>;





function App() {
  const [, setTick] = useState(0);

  useEffect(() => {
    modules.forEach((module) => shell.register(module));

    shell.start(() => {
      setTick((t) => t+1);
    });

    return () => {
      shell.stop();
    };
  }, []);


  const state = shell.getState() as ShellState;

  const renderSlot = (slot: LayoutSlot) => {
    return Object.entries(state).map(([moduleId, moduleState]) => {
      const typedState = moduleState as ModuleState;

      //console.log("rendering module:", moduleId, moduleState);

      if (typedState.position !== slot) return null;

      const ModuleComponent = widgetRegistry[moduleId];

      if (!ModuleComponent) return null;

      return (
        <ModuleComponent
          key={moduleId}
          state={typedState}
        />
      );
    });
  };

  const cellStyle = {
    width: "100%",
    height: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  };


  return (
    <div
      style={{
        background: "linear-gradient(135deg, #1a1a1a, #2d2d2d)",
        color: "white",
        width: "100%",
        height: "100vh",
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1fr",
        gridTemplateRows: "1fr 1fr 1fr 0.4fr",
        gap: "10px",
        boxSizing: "border-box",
      }}
    >
      {/* Top Row */}
      <div style={cellStyle}>{renderSlot("top-left")}</div>
      <div style={cellStyle}>{renderSlot("top-middle")}</div>
      <div style={cellStyle}>{renderSlot("top-right")}</div>

      {/* Middle Row */}
      <div style={cellStyle}>{renderSlot("middle-left")}</div>
      <div style={cellStyle}>{renderSlot("middle")}</div>
      <div style={cellStyle}>{renderSlot("middle-right")}</div>

      {/* Bottom Row */}
      <div style={cellStyle}>{renderSlot("bottom-left")}</div>
      <div style={cellStyle}>{renderSlot("bottom-middle")}</div>
      <div style={cellStyle}>{renderSlot("bottom-right")}</div>

      {/* Bottom Bar */}
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
  );
}

export default App;