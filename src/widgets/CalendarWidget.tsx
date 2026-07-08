type Props = {
    state: {
        data: {
            events: Array<{ id: string; title: string; time: string }>;
        }
    };
};

export function CalendarWidget({ state }: Props) {
    return (
        <div className="widget-container" style={{ width: "100%", height: "100%", justifyContent: "flex-start", alignItems: "flex-start", padding: "2rem" }}>
            <h2 className="widget-subtitle" style={{ marginBottom: "1.5rem", textTransform: "uppercase", letterSpacing: "2px" }}>
                Today
            </h2>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", width: "100%" }}>
                {state.data.events.map((event) => (
                    <div key={event.id} style={{ display: "flex", flexDirection: "column", borderBottom: "1px solid rgba(255,255,255,0.2)", paddingBottom: "1rem" }}>
                        <span style={{ fontSize: "1.5rem", fontWeight: 600 }}>
                            {event.title}
                        </span>
                        <span className="widget-subtitle" style={{ marginTop: "0.25rem" }}>
                            {event.time}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}