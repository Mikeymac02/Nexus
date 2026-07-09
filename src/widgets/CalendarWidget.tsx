import type { ModuleSize } from "../shell/shell";

type Props = {
    state: {
        size: ModuleSize;
        data: {
            currentDate: string;
            events: { title: string; time: string; location?: string | null }[];
        };
    };
};

export function CalendarWidget({ state }: Props) {
    const events = state?.data?.events || [];
    const currentDate = state?.data?.currentDate || "Loading date...";

    return (
        <div className="widget-container" style={{ 
            width: "100%", 
            height: "100%", 
            padding: "2rem", 
            display: "flex", 
            flexDirection: "column", 
            justifyContent: "flex-start",
            alignItems: "flex-start", // <-- Forces the entire widget's contents to the left edge
            textAlign: "left"         // <-- Explicitly aligns the text to the left
        }}>
            <h3 style={{ 
                letterSpacing: "1px", 
                fontSize: "1.2rem", 
                opacity: 0.9, 
                marginBottom: "1.5rem",
                fontWeight: 600
            }}>
                {currentDate}
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: "1rem", width: "100%" }}>
                {events.map((event, index) => (
                    <div key={index} style={{ 
                        display: "flex", 
                        flexDirection: "column",
                        alignItems: "flex-start", // <-- Forces the title and time stack to left-align
                        borderBottom: index < events.length - 1 ? "1px solid rgba(255,255,255,0.15)" : "none",
                        paddingBottom: index < events.length - 1 ? "1rem" : "0",
                        width: "100%"
                    }}>
                        <span style={{ fontSize: "1.2rem", fontWeight: 600 }}>
                            {event.location ? `${event.title} - ${event.location}` : event.title}
                        </span>
                        
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", marginTop: "0.25rem" }}>
                            {event.time && (
                                <span style={{ fontSize: "0.95rem", opacity: 0.7 }}>
                                    {event.time}
                                </span>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}