type Props = {
    state: {
        data: {
            now: string;
        };
    };
};

export function exampleWidget({ state }: Props) {
    return (
        <div>
            {state.data.now}
        </div>
        );
}


