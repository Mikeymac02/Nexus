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
        <div
            style ={{
                fontSize: "1rem",
                fontWeight: 500,
                letterSpacing: "2px",
                lineHeight: 1,
            }}>
            <div>{state.data.temp}°F</div>
            <div>{state.data.condition}</div>
        </div>
    );
}