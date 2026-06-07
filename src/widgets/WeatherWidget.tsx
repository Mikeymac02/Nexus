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
        <div>
            <div>{state.data.temp}°F</div>
            <div>{state.data.condition}</div>
        </div>
    );
}