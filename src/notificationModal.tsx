import React, { useEffect, useState, useRef } from "react";
import { NotificationPayload } from "./notificationService";

interface NotificationModalProps {
  notification: NotificationPayload | null;
  onDismiss: () => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  notification,
  onDismiss,
}) => {
  const [activePayload, setActivePayload] = useState<NotificationPayload | null>(null);
  const [isExiting, setIsExiting] = useState(false);
  const onDismissRef = useRef(onDismiss);

  useEffect(() => {
    onDismissRef.current = onDismiss;
  }, [onDismiss]);

  useEffect(() => {
    if (notification) {
      setActivePayload(notification);
      setIsExiting(false);

      const duration = notification.duration ?? 5000;
      if (duration > 0) {
        const timer = setTimeout(() => {
          setIsExiting(true);
          setTimeout(() => {
            setActivePayload(null);
            onDismissRef.current();
          }, 300); // Wait 300ms for exit animation
        }, duration);
        return () => clearTimeout(timer);
      }
    } else if (activePayload && !isExiting) {
      setIsExiting(true);
      const timer = setTimeout(() => {
        setActivePayload(null);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  if (!activePayload) return null;

  const getTypeColor = () => {
    switch (activePayload.type) {
      case "warning":
        return "#f59e0b";
      case "error":
        return "#ef4444";
      case "success":
        return "#10b981";
      default:
        return "#6366f1"; // default indigo
    }
  };

  return (
    <>
      <style>{`
        @keyframes nexusFadeIn {
          from { opacity: 0; backdrop-filter: blur(0px); -webkit-backdrop-filter: blur(0px); }
          to { opacity: 1; backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); }
        }
        @keyframes nexusFadeOut {
          from { opacity: 1; backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); }
          to { opacity: 0; backdrop-filter: blur(0px); -webkit-backdrop-filter: blur(0px); }
        }
        @keyframes nexusPopIn {
          from { opacity: 0; transform: scale(0.85) translateY(12px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes nexusPopOut {
          from { opacity: 1; transform: scale(1) translateY(0); }
          to { opacity: 0; transform: scale(0.9) translateY(12px); }
        }
      `}</style>
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 9999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: isExiting ? "rgba(0, 0, 0, 0)" : "rgba(0, 0, 0, 0.65)",
          backdropFilter: isExiting ? "blur(0px)" : "blur(20px)",
          WebkitBackdropFilter: isExiting ? "blur(0px)" : "blur(20px)",
          padding: "20px",
          pointerEvents: isExiting ? "none" : "auto",
          animation: isExiting ? "nexusFadeOut 0.3s ease-in-out forwards" : "nexusFadeIn 0.3s ease-in-out forwards",
        }}
      >
        <div
          style={{
            background: "rgba(22, 22, 32, 0.92)",
            border: `1px solid ${getTypeColor()}66`,
            boxShadow: `0 20px 50px rgba(0, 0, 0, 0.6), 0 0 35px ${getTypeColor()}33`,
            borderRadius: "28px",
            padding: "36px 44px",
            maxWidth: "520px",
            width: "90%",
            textAlign: "center",
            color: "#ffffff",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            animation: isExiting ? "nexusPopOut 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards" : "nexusPopIn 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards",
          }}
        >
          {/* Icon / Badge */}
          <div
            style={{
              fontSize: "52px",
              marginBottom: "14px",
              lineHeight: "1",
            }}
          >
            {activePayload.icon || (activePayload.type === "warning" ? "⚠️" : activePayload.type === "error" ? "🚨" : "🔔")}
          </div>

          {/* Title */}
          <h2
            style={{
              margin: "0 0 12px 0",
              fontSize: "1.75rem",
              fontWeight: 700,
              color: getTypeColor(),
              letterSpacing: "0.5px",
            }}
          >
            {activePayload.title}
          </h2>

          {/* Message */}
          <p
            style={{
              margin: 0,
              fontSize: "1.15rem",
              lineHeight: "1.55",
              color: "rgba(255, 255, 255, 0.92)",
            }}
          >
            {activePayload.message}
          </p>
        </div>
      </div>
    </>
  );
};
