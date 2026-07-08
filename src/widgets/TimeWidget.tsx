type Props = {
    state: {
        data: {
            now: string;
        };
    };
};

export function TimeWidget({ state }: Props) {
    return (
        <div className="widget-container">
            <h1 className="widget-primary-data">{state.data.now}</h1>
            </div>
        );
}


