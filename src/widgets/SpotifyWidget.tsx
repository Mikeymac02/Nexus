import type { ModuleSize } from "../shell/shell";

type Props = {
    state: {
        size: ModuleSize;
        data: {
            isPlaying: boolean; // <-- Added this new boolean flag
            songName: string;
            artistName: string;
            albumCover: string;
            progress: { currentText: string; totalText: string; percent: number };
            playlist: string[];
        }
    };
};

export function SpotifyWidget({ state }: Props) {
    const { size, data } = state;

    // IF NOTHING IS PLAYING: Render absolutely nothing (hides the widget)
    if (!data.isPlaying) {
        return null;
    }

    // 1. Core Info (Always shown regardless of size)
    const BaseInfo = (
        <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
            <img 
                src={data.albumCover} 
                alt="Album Cover" 
                style={{ width: "90px", height: "90px", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.3)" }} 
            />
            <div style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ fontSize: "1.8rem", fontWeight: 700, letterSpacing: "1px" }}>{data.songName}</span>
                <span className="widget-subtitle" style={{ fontSize: "1.2rem", marginTop: "0.25rem", opacity: 0.8 }}>{data.artistName}</span>
            </div>
        </div>
    );

    // 2. Progress Bar (Shown on medium, tall, and large)
    const ProgressBar = (
        <div style={{ width: "100%", marginTop: "2rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem", opacity: 0.7, marginBottom: "0.5rem" }}>
                <span>{data.progress.currentText}</span>
                <span>{data.progress.totalText}</span>
            </div>
            <div style={{ width: "100%", height: "6px", backgroundColor: "rgba(255,255,255,0.2)", borderRadius: "3px" }}>
                <div style={{ width: `${data.progress.percent}%`, height: "100%", backgroundColor: "#1DB954", borderRadius: "3px" }} />
            </div>
        </div>
    );

    // 3. Playlist (Shown only on tall and large sizes)
    const Playlist = (
        <div style={{ marginTop: "2rem", width: "100%", flex: 1 }}>
            <h3 className="widget-subtitle" style={{ textTransform: "uppercase", letterSpacing: "2px", marginBottom: "1rem" }}>
                Up Next
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {data.playlist.map((song, idx) => (
                    <div key={idx} style={{ display: "flex", alignItems: "center", gap: "1rem", opacity: 0.8 }}>
                        <span style={{ fontSize: "1rem", fontWeight: 600 }}>{idx + 1}</span>
                        <span style={{ fontSize: "1.2rem" }}>{song}</span>
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <div className="widget-container" style={{ 
            width: "100%", 
            height: "100%", 
            padding: "2rem", 
            display: "flex", 
            flexDirection: "column", 
            // Dynamically center if small, otherwise start at the top
            justifyContent: size === "small" ? "center" : "flex-start" 
        }}>
            {BaseInfo}
            {(size === "medium" || size === "large" || size === "tall") && ProgressBar}
            {(size === "large" || size === "tall") && Playlist}
        </div>
    );
}