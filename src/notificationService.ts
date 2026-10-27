/* eslint-disable @typescript-eslint/no-explicit-any */
export interface NotificationPayload {
  id?: string;
  title: string;
  message: string;
  type?: "info" | "warning" | "error" | "success";
  notificationType?: "modal" | "achievement" | "bubble"; // Default is "bubble"
  icon?: string;
  image?: string; // Optional image URL or base64 data
  duration?: number; // Duration in ms (default 5000ms)
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
 * Examples:
 *  - notify({ title: "Doorbell", message: "Motion detected at porch", notificationType: "bubble", image: "https://example.com/snapshot.jpg" });
 *  - notify({ title: "Achievement Unlocked", message: "Night Owl", notificationType: "achievement" });
 */
export function notify(payload: NotificationPayload) {
  notificationService.show(payload);
}

// Attach to window object for raw JS or browser console access
if (typeof window !== "undefined") {
  (window as any).nexusNotify = notify;
}
