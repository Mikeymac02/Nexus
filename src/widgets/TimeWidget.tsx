type Props = {
    state: {
        data: {
            now: string;
        };
    };
};

export function TimeWidget({ state }: Props) {
    return (
        <div
            style ={{
                fontSize: "3rem",
                fontWeight: 300,
                letterSpacing: "2px",
                lineHeight: 1,
            }}>
            {state.data.now}
        </div>
        );
}


