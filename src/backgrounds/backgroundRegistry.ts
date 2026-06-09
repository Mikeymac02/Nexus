export type BackgroundDefinition = {
    id: string;
    name: string;
    type: "gradient" | "photo" | "solid";
    value: string;
};

export const backgrounds = [
    {
        id: "dark-gradient",
        name: "Dark Gradient",
        type: "gradient",
        value: "linear-gradient(135deg, #1a1a1a, #2d2d2d)",
    },
    {
        id: "purple-gradient",
        name: "Purple Gradient",
        type: "gradient",
        value: "linear-gradient(135deg, #885db2, #43549e)",
    },
    {
        id: "blue-gradient",
        name: "Blue Gradient",
        type: "gradient",
        value: "linear-gradient(135deg, #46559b, #37006f)",
    },
    {
        id: "space",
        name: "Space",
        type: "photo",
        value: "/backgrounds/space.jpg",
    }
];