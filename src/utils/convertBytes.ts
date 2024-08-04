
type Luv = {
    name: string,
    short: string,
    value: number,
}
const lut: Luv[] = [
    {
        name: "terabyte",
        short: "TB",
        value: Math.pow(1000, 4),
    },
    {
        name: "gigabyte",
        short: "GB",
        value: Math.pow(1000, 3),
    },
    {
        name: "megabyte",
        short: "MB",
        value: Math.pow(1000, 2),
    },
    {
        name: "kilobyte",
        short: "kB",
        value: Math.pow(1000, 1),
    },
]

export function convertBytes(bytes?: number): string {
    if (!bytes) {
        return "0 B"
    }

    for(const luv of lut) {
        const value = bytes / luv.value;
        if(value < 1) {
            continue;
        }

        return `${Math.round(value * 100) / 100} ${luv.short}`;
    }

    return `${bytes} B`;
}