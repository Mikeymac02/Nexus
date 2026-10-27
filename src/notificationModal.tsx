/* eslint-disable react-hooks/set-state-in-effect */
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
  const [activeNotif, setActiveNotif] = useState<NotificationPayload | null>(null);
  const [isExiting, setIsExiting] = useState(false);
  const dismissRef = useRef(onDismiss);

  useEffect(() => {
    dismissRef.current = onDismiss;
  }, [onDismiss]);

  useEffect(() => {
    if (notification) {
      setActiveNotif(notification);
      setIsExiting(false);

      const duration = notification.duration ?? 5000;
      if (duration > 0) {
        const timer = setTimeout(() => {
          setIsExiting(true);
          setTimeout(() => {
            setActiveNotif(null);
            setIsExiting(false);
            dismissRef.current();
          }, 320); // 320ms exit transition
        }, duration);

        return () => clearTimeout(timer);
      }
    }
  }, [notification]);

  if (!activeNotif) return null;

  const styleType = activeNotif.notificationType || "bubble"; // Default to iPhone "bubble" style

  const getTypeColor = () => {
    switch (activeNotif.type) {
      case "warning":
        return "#f59e0b";
      case "error":
        return "#ef4444";
      case "success":
        return "#10b981";
      default:
        return "#6366f1";
    }
  };

  // =========================================================
  // 📱 STYLE 1: iPhone "Bubble" Banner Notification
  // =========================================================
  if (styleType === "bubble") {
    return (
      <div
        style={{
          position: "fixed",
          top: "20px",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 9999,
          width: "90%",
          maxWidth: "420px",
          backgroundColor: "rgba(25, 25, 35, 0.82)",
          backdropFilter: "blur(25px) saturate(180%)",
          WebkitBackdropFilter: "blur(25px) saturate(180%)",
          borderRadius: "22px",
          border: "1px solid rgba(255, 255, 255, 0.16)",
          boxShadow: "0 12px 35px rgba(0, 0, 0, 0.45), inset 0 1px 1px rgba(255, 255, 255, 0.2)",
          padding: "14px 18px",
          color: "#ffffff",
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Segoe UI', Roboto, sans-serif",
          opacity: isExiting ? 0 : 1,
          marginTop: isExiting ? "-20px" : "0px",
          scale: isExiting ? "0.95" : "1",
          transition: "all 0.32s cubic-bezier(0.16, 1, 0.3, 1)",
          boxSizing: "border-box",
        }}
      >
        {/* Header Bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "8px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <div
              style={{
                width: "18px",
                height: "18px",
                borderRadius: "5px",
                background: getTypeColor(),
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "10px",
                fontWeight: "bold",
                color: "#fff",
              }}
            >
              N
            </div>
            <span
              style={{
                fontSize: "0.72rem",
                fontWeight: 600,
                letterSpacing: "0.8px",
                textTransform: "uppercase",
                color: "rgba(255, 255, 255, 0.65)",
              }}
            >
              NEXUS
            </span>
          </div>
          <span style={{ fontSize: "0.7rem", color: "rgba(255, 255, 255, 0.45)" }}>now</span>
        </div>

        {/* Content Body */}
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          {/* Optional Image or Icon */}
          {activeNotif.image ? (
            <img
              src={activeNotif.image}
              alt="Notification"
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "12px",
                objectFit: "cover",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                flexShrink: 0,
              }}
            />
          ) : activeNotif.icon ? (
            <div
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "12px",
                backgroundColor: `${getTypeColor()}22`,
                border: `1px solid ${getTypeColor()}44`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "22px",
                flexShrink: 0,
              }}
            >
              {activeNotif.icon}
            </div>
          ) : null}

          {/* Text Info */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <h4
              style={{
                margin: "0 0 3px 0",
                fontSize: "0.95rem",
                fontWeight: 600,
                color: "#ffffff",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {activeNotif.title}
            </h4>
            <p
              style={{
                margin: 0,
                fontSize: "0.85rem",
                lineHeight: "1.35",
                color: "rgba(255, 255, 255, 0.85)",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {activeNotif.message}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================
  // 🎮 STYLE 2: Gaming Console "Achievement" Banner
  // =========================================================
  if (styleType === "achievement") {
    return (
      <div
        style={{
          position: "fixed",
          top: "20px",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 9999,
          display: "flex",
          alignItems: "center",
          gap: "14px",
          background: "rgba(18, 18, 26, 0.94)",
          border: `1px solid ${getTypeColor()}66`,
          boxShadow: `0 10px 30px rgba(0, 0, 0, 0.5), 0 0 20px ${getTypeColor()}33`,
          borderRadius: "40px",
          padding: "10px 24px 10px 12px",
          color: "#ffffff",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          maxWidth: "460px",
          width: "90%",
          opacity: isExiting ? 0 : 1,
          marginTop: isExiting ? "-15px" : "0px",
          transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
          boxSizing: "border-box",
        }}
      >
        {/* Achievement Icon / Badge */}
        {activeNotif.image ? (
          <img
            src={activeNotif.image}
            alt="Achievement"
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "50%",
              objectFit: "cover",
              border: `2px solid ${getTypeColor()}`,
              flexShrink: 0,
            }}
          />
        ) : (
          <div
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "50%",
              background: `radial-gradient(circle, ${getTypeColor()}ff 0%, ${getTypeColor()}aa 100%)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "22px",
              boxShadow: `0 0 12px ${getTypeColor()}88`,
              flexShrink: 0,
            }}
          >
            {activeNotif.icon || "🏆"}
          </div>
        )}

        {/* Text Area */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: "0.7rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "1.2px",
              color: "#f59e0b",
              marginBottom: "2px",
            }}
          >
            🏆 ACHIEVEMENT UNLOCKED
          </div>
          <div
            style={{
              fontSize: "0.95rem",
              fontWeight: 600,
              color: "#ffffff",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {activeNotif.title}
          </div>
          <div
            style={{
              fontSize: "0.8rem",
              color: "rgba(255, 255, 255, 0.75)",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {activeNotif.message}
          </div>
        </div>
      </div>
    );
  }

  // =========================================================
  // 🚨 STYLE 3: Full-Screen Blurred "Modal" Card
  // =========================================================
  return (
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
        opacity: isExiting ? 0 : 1,
        transition: "all 0.3s ease",
      }}
    >
      <div
        style={{
          background: "rgba(22, 22, 32, 0.9)",
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
          transform: isExiting ? "scale(0.9)" : "scale(1)",
          transition: "transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
        }}
      >
        {activeNotif.image ? (
          <img
            src={activeNotif.image}
            alt="Modal Visual"
            style={{
              maxWidth: "100%",
              maxHeight: "180px",
              borderRadius: "16px",
              marginBottom: "16px",
              objectFit: "cover",
            }}
          />
        ) : (
          <div
            style={{
              fontSize: "52px",
              marginBottom: "14px",
              lineHeight: "1",
            }}
          >
            {activeNotif.icon ||
              (activeNotif.type === "warning" ? "⚠️" : activeNotif.type === "error" ? "🚨" : "🔔")}
          </div>
        )}

        <h2
          style={{
            margin: "0 0 12px 0",
            fontSize: "1.75rem",
            fontWeight: 700,
            color: getTypeColor(),
            letterSpacing: "0.5px",
          }}
        >
          {activeNotif.title}
        </h2>

        <p
          style={{
            margin: 0,
            fontSize: "1.15rem",
            lineHeight: "1.55",
            color: "rgba(255, 255, 255, 0.92)",
          }}
        >
          {activeNotif.message}
        </p>
      </div>
    </div>
  );
};
