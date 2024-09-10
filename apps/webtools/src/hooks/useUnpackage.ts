import { FlowfileAttributeRowSchema } from "../utils/schemas";

export function findFilename(rows: FlowfileAttributeRowSchema[]) {
    const filteredRows = rows.filter((x) => x[0] === "filename");
    if (filteredRows.length == 1) {
        return filteredRows[0][1];
    } else {
        return new Date().toString() + ".bin";
    }
}

export function findMimetype(rows: FlowfileAttributeRowSchema[]) {
    const filteredRows = rows.filter((x) => x[0] === "mime.type");
    if (filteredRows.length == 1) {
        return filteredRows[0][1];
    } else {
        return "application/octet-stream";
    }
}