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
  const background = shell.getBackground();

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

  const leftCellStyle = {
    width: "100%",
    height: "100%",
    display: "flex",
    justifyContent: "flex-start",
    alignItems: "center",
    overflow: "hidden",
    paddingLeft: "30px",
  };

  const middleCellStyle = {
    width: "100%",
    height: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  };

  const rightCellStyle = {
    width: "100%",
    height: "100%",
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
    overflow: "hidden",
    paddingRight: "100px",
    //border: "2px solid red",
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
              : undefined,
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
        {/* Top Row */}
        <div style={leftCellStyle}>{renderSlot("top-left")}</div>
        <div style={middleCellStyle}>{renderSlot("top-middle")}</div>
        <div style={rightCellStyle}>{renderSlot("top-right")}</div>

        {/* Middle Row */}
        <div style={leftCellStyle}>{renderSlot("middle-left")}</div>
        <div style={middleCellStyle}>{renderSlot("middle")}</div>
        <div style={rightCellStyle}>{renderSlot("middle-right")}</div>

        {/* Bottom Row */}
        <div style={leftCellStyle}>{renderSlot("bottom-left")}</div>
        <div style={middleCellStyle}>{renderSlot("bottom-middle")}</div>
        <div style={rightCellStyle}>{renderSlot("bottom-right")}</div>

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
      </>
  );
}

export default App;