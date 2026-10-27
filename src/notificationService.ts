/* eslint-disable @typescript-eslint/no-explicit-any */
export interface NotificationPayload {
  id?: string;
  title: string;
  message: string;
  type?: "info" | "warning" | "error" | "success";
  icon?: string;
  duration?: number; // Duration in ms (default 6000ms, set to 0 for persistent)
}

type NotificationListener = (notification: NotificationPayload) => void;

class NotificationService {
  private listeners: NotificationListener[] = [];

  subscribe(listener: NotificationListener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  show(payload: NotificationPayload) {
    this.listeners.forEach((listener) => listener(payload));
  }
}

export const notificationService = new NotificationService();

/**
 * Universal notification function — call this from ANY module, widget, or background process!
 * Example: notify({ title: "Doorbell", message: "Someone is at the front door!", icon: "🚪" });
 */
export function notify(payload: NotificationPayload) {
  notificationService.show(payload);
}

// Attach to window object for raw JS or browser console access
if (typeof window !== "undefined") {
  (window as any).nexusNotify = notify;
}
