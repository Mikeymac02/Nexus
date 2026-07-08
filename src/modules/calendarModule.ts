import type { LayoutSlot, ModuleSize } from "../shell/shell"

export const calendarModule = {
  id: "calendar",
  name: "Calendar",
  refreshInterval: 60000, // 1 minute
  position: "middle-left" as LayoutSlot, 
  size: "tall" as ModuleSize,

  async update() {
    return {
      data: {
        events: [
          { id: "1", title: "Team Standup", time: "10:00 AM" },
          { id: "2", title: "Project Review", time: "1:30 PM" },
          { id: "3", title: "Dinner with Sarah", time: "6:30 PM" }
        ]
      },
    };
  },
};