type Props = {
    state: {
        data: {
            temp: number;
            condition: string;
        }
    };
};

export function WeatherWidget({ state }: Props) {
    return (
        <div className="widget-container">
            <h1 className="widget-primary-data">{state.data.temp}°F
            </h1>
            <p className="widget-subtitle">
                {state.data.condition}
            </p>
        </div>
    );
}