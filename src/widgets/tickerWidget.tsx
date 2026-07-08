type Props = {
    state: {
        data: {
            headlines: string[];
        }
    };
};

export function TickerWidget({ state }: Props) {
    // Join the array of headlines together with a bullet point separator
    const tickerText = state.data.headlines.join("   •   ");

    return (
        <div style={{ 
            width: "100%", 
            backgroundColor: "rgba(0, 0, 0, 0.4)", // Translucent dark background
            padding: "1rem", 
            overflow: "hidden", 
            whiteSpace: "nowrap",
            borderTop: "1px solid rgba(255,255,255,0.1)", // Subtle top border
            backdropFilter: "blur(10px)"
        }}>
            {/* Injecting a standard CSS keyframe animation directly into the component */}
            <style>
                {`
                @keyframes scrollTicker {
                    0% { transform: translateX(100vw); }
                    100% { transform: translateX(-100%); }
                }
                .scrolling-text {
                    display: inline-block;
                    animation: scrollTicker 25s linear infinite;
                    font-size: 1.2rem;
                    font-weight: 500;
                    letter-spacing: 2px;
                    text-transform: uppercase;
                }
                `}
            </style>
            
            <div className="scrolling-text">
                {tickerText}
            </div>
        </div>
    );
}