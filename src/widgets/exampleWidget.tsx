type Props = {
    state: {
        data: {
            now: string;
        };
    };
};

export function TimeWidget({ state }: Props) {
    return (
        <div>
            {state.data.now}
        </div>
        );
}


