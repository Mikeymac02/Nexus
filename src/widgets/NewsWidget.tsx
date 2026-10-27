import React from "react";

export interface NewsItem {
  id?: string;
  title: string;
  source?: string;
  time?: string;
}

export interface NewsWidgetProps {
  state: {
    data?: {
      items?: NewsItem[];
      headlines?: string[];
      lastUpdated?: string;
    };
  };
}

export const NewsWidget: React.FC<NewsWidgetProps> = ({ state }) => {
  const newsItems: NewsItem[] = state?.data?.items || 
    (state?.data?.headlines ? state.data.headlines.map(h => ({ title: h })) : [
      { title: "Nexus Smart Display initialized — awaiting live RSS feed update", source: "Nexus", time: "Just now" },
      { title: "System status nominal — all grid modules operating smoothly", source: "System", time: "1m ago" }
    ]);

  // Duplicate items for seamless infinitely looping marquee
  const tickerItems = [...newsItems, ...newsItems];

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        backgroundColor: "rgba(15, 15, 20, 0.65)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderRadius: "16px",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        padding: "0 16px",
        boxSizing: "border-box",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* Keyframe Animation Injection */}
      <style>{`
        @keyframes ticker-scroll {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        .nexus-ticker-track {
          display: flex;
          align-items: center;
          gap: 32px;
          white-space: nowrap;
          animation: ticker-scroll 35s linear infinite;
          will-change: transform;
        }
        .nexus-ticker-track:hover {
          animation-play-state: paused;
        }
      `}</style>

      {/* Static News Badge */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          backgroundColor: "rgba(239, 68, 68, 0.2)",
          border: "1px solid rgba(239, 68, 68, 0.4)",
          padding: "4px 12px",
          borderRadius: "20px",
          fontSize: "0.75rem",
          fontWeight: 700,
          color: "#f87171",
          letterSpacing: "0.05em",
          textTransform: "uppercase",
          flexShrink: 0,
          marginRight: "16px",
          zIndex: 2,
        }}
      >
        <span
          style={{
            width: "6px",
            height: "6px",
            borderRadius: "50%",
            backgroundColor: "#ef4444",
            boxShadow: "0 0 8px #ef4444",
          }}
        />
        NEWS
      </div>

      {/* Scrolling Track Container */}
      <div
        style={{
          overflow: "hidden",
          width: "100%",
          display: "flex",
          alignItems: "center",
          maskImage: "linear-gradient(to right, transparent, black 20px, black calc(100% - 20px), transparent)",
          WebkitMaskImage: "linear-gradient(to right, transparent, black 20px, black calc(100% - 20px), transparent)",
        }}
      >
        <div className="nexus-ticker-track">
          {tickerItems.map((item, index) => (
            <div
              key={index}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "10px",
                fontSize: "0.9rem",
                fontWeight: 400,
                color: "rgba(255, 255, 255, 0.9)",
              }}
            >
              <span style={{ fontWeight: 500 }}>{item.title}</span>
              {item.source && (
                <span
                  style={{
                    fontSize: "0.75rem",
                    color: "rgba(255, 255, 255, 0.45)",
                    backgroundColor: "rgba(255, 255, 255, 0.08)",
                    padding: "2px 8px",
                    borderRadius: "4px",
                  }}
                >
                  {item.source}
                </span>
              )}
              <span style={{ color: "rgba(255, 255, 255, 0.25)", margin: "0 4px" }}>•</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NewsWidget;
