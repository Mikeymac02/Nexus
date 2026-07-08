type Props = {
    state: {
        data: {
            day: string;
            events: {
                time: string;
                title: string;
            }[];
        };
    };
};

export function CalendarWidget({ state }: Props) {

    let addition: string;
    switch (state.data.day[state.data.day.length - 1]) {
        case "1":
            addition = "st";
            break;
        case "2":
            addition = "nd";
            break;
        case "3":
            addition = "rd";
            break;
        default:
            addition = "th";
    }

    const date = state.data.day + addition;
    return (
        <div>
            <h3
                style={{ fontWeight: 600, }}>
                {date}
            </h3>
            {state.data.events.map((event) => (
                <div
                style={{ fontWeight: 200}}>
                    {event.title}
                </div>
            ))}
        </div>
    );
}


