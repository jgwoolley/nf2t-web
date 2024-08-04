

export function convertDate(epoch?: number): string {
    if(!epoch) {
        return ""
    }

    return new Date(epoch).toLocaleString()
}