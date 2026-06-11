import { useEffect, useState } from "react";

import type { LayoutSlot } from "./shell/shell";
import { shell, ModuleState } from './shell/shell';
import { modules } from "./modules/moduleRegistry";
import { widgetRegistry } from "./widgets/widgetRegistry";





type ShellState = Record<string, ModuleState>;



function App() {
  const [, setTick] = useState(0);

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
    };
    return positions[position];
  }
  
  const getGridPlacement = (state: ModuleState) => {
    if (state.size === "medium") {
      return {
        columnSpan: 2,
        rowSpan: 1,
      };
    } if (state.size === "large") {
      return {
        columnSpan: 2,
        rowSpan: 2,
      };
    } if (state.size === "tall") {
      return {
        columnSpan: 1,
        rowSpan: 2,
      };
    }
    return {
      columnSpan: 1,
      rowSpan: 1,
    };
    
  };




    const renderSlot = (slot: LayoutSlot) => {
    return Object.entries(state).map(([moduleId, moduleState]) => {
      if (moduleState.position !== slot) return null;

      const ModuleComponent = widgetRegistry[moduleId];
      if (!ModuleComponent) return null;

      return (
        <ModuleComponent
          key={moduleId}
          state={moduleState}
        />
      );
    }); 
  };



  const renderModules = () => {
    return Object.entries(state).map(([moduleId, moduleState]) => {
      if (moduleState.position === "bottom-bar") { return null; }

      const ModuleComponent = widgetRegistry[moduleId];
      if (!ModuleComponent) return null;

      const gridPosition = getGridPosition(moduleState.position);
      const gridPlacement = getGridPlacement(moduleState);


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

        {renderModules()}

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