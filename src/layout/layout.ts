import type { LayoutSlot, ModuleSize } from "../shell/shell";

export const slotGrid: LayoutSlot[][] = [
  ["top-left", "top-middle", "top-right"],
  ["middle-left", "middle", "middle-right"],
  ["bottom-left", "bottom-middle", "bottom-right"],
];

export const sizeDefinitions: Record<
  ModuleSize,
  { width: number; height: number }
>  = {
  small: { width: 1, height: 1 },
  medium: { width: 2, height: 1 },
  tall: { width: 1, height: 2 },
  large: { width: 2, height: 2 },
};