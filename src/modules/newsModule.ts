/* eslint-disable @typescript-eslint/no-unused-vars */
//import type { ModuleDefinition } from "../shell/types";

export interface NewsItem {
  title: string;
  source: string;
  time: string;
}

export const newsModule = {
  id: "news",
  name: "News Ticker",
  defaultPosition: "bottom-bar",
  defaultSize: "small",
  refreshInterval: 300000,

  async update() {
    try {
      // Fetch news feed endpoint
      const res = await fetch("/api/news");
      if (res.ok) {
        const data = await res.json();
        if (data.items) return { data };
      }
    } catch (e) {
      // Fallback headlines when offline
    }

    return {
      data: {
        items: [
          { title: "Tech Breakthrough: Next-Gen Smart Displays Revolutionize Home Dashboards", source: "TechDaily", time: "10m ago" },
          { title: "Global Market Summary: Tech Indices Surge on Innovation Growth", source: "Markets Today", time: "25m ago" },
          { title: "Space Exploration Milestone: New Lunar Observatory Transmits First Images", source: "AstroNews", time: "1h ago" },
          { title: "Weather Forecast Update: Mild Temperatures Expected Across North America", source: "Weather Network", time: "2h ago" },
        ],
        lastUpdated: new Date().toLocaleTimeString(),
      },
    };
  },
};
