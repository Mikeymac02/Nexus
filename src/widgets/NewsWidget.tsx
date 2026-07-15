import type { ModuleSize } from "../shell/shell";

type Props = {
    state: {
        size: ModuleSize;
        data: {
            headlines: string[];
        };
    };
};

export function NewsWidget({ state }: Props) {
    const headlines = state?.data?.headlines || [];
    
    const tickerText = headlines.join("   •   ");

    return (
        <div className="widget-container" style={{ 
            width: "100%", 
            height: "100%",      
            overflow: "hidden", 
            whiteSpace: "nowrap", 
            display: "flex", 
            alignItems: "center",
            padding: "0 2rem"    
        }}>
            <style>
                {`
                    @keyframes scroll {
                        0% { transform: translateX(100vw); }
                        100% { transform: translateX(-100%); }
                    }
                    .ticker-text {
                        display: inline-block;
                        animation: scroll 40s linear infinite;
                        font-size: 1.5rem;
                        font-weight: 500;
                        letter-spacing: 1px;
                        opacity: 0.9;
                        line-height: 1.5;         
                        padding-bottom: 0.2rem;   
                    }
                `}
            </style>
            <div className="ticker-text">
                {tickerText ? tickerText : "Loading latest headlines..."}
            </div>
        </div>
    );
}