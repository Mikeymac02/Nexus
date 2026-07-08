import type { LayoutSlot, ModuleSize } from "../shell/shell"

export const tickerModule = {
  id: "ticker",
  name: "Live Ticker",
  refreshInterval: 60000, 
  position: "bottom-bar" as LayoutSlot,
  size: "large" as ModuleSize, // Size is ignored for the bottom-bar in your layout, but required by the type system

  async update() {
    return {
      data: {
        headlines: [
          "NFL: Eagles win 24-17 over Cowboys",
          "Smart Home: All doors locked, security system armed",
          "Crypto: BTC up 4.2% today",
          "System: Nexus OS running optimally"
        ]
      },
    };
  },
};