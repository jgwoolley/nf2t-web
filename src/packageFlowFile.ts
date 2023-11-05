import { FlowfileAttributeRowSchema, } from "./schemas";

const MAGIC_HEADER = 'NiFiFF3';
const MAX_VALUE_2_BYTES = 65535;

/**
 * 
 * @see https://www.youtube.com/watch?v=y112ifgOsW0
 * 
 * @param bytes 
 * @param text 
 */
function pushUTF8(bytes: number[], text: string) {
    for(var i=0; i < text.length; i++) {
        var charcode = text.charCodeAt(i);
        if(charcode < 0x80) {
            bytes.push(charcode)
        } else {
            throw new Error();
        }
    }
}

function writeFieldLength(bytes: number[], numBytes: number) {
    if (numBytes < MAX_VALUE_2_BYTES) {
        bytes.push(numBytes >>> 8);
        bytes.push(numBytes);
    } else {
        bytes.push(0xff);
        bytes.push(0xff);
        bytes.push(numBytes >>> 24);
        bytes.push(numBytes >>> 16);
        bytes.push(numBytes >>> 8);
        bytes.push(numBytes);
    }
}

function writeString(bytes: number[], val: string)  {
    const new_bytes: number[] = []
    pushUTF8(new_bytes, val);
    writeFieldLength(bytes, new_bytes.length);
    for(var i=0; i < new_bytes.length; i++) {
        bytes.push(new_bytes[i]);
    }
}

function byteHelper(val: number, i: number) {
    return ((Math.floor(val / Math.pow(2, 8*(7 - i))) + 128) % 256) - 128;
}

function writeLong(bytes: number[], val: number) {
    const new_bytes = [
        byteHelper(val, 0),
        byteHelper(val, 1),
        byteHelper(val, 2),
        byteHelper(val, 3),
        byteHelper(val, 4),
        byteHelper(val, 5),
        byteHelper(val, 6),
        byteHelper(val, 7),
    ];
    console.log(new_bytes);
    console.log(bytes);
    for(let x of new_bytes.entries()) {
        bytes.push(x[1]);
    }
    console.log(bytes);
}

function findFilename(rows: FlowfileAttributeRowSchema[], file: File) {
    const filteredRows = rows.filter((x) => x.key === "filename");
    if (filteredRows.length == 0) {
        rows.push({
            key: "filename",
            value: file.name,
        });
        return file.name;
    } else {
        return filteredRows[0].value;
    }
}

export function packageFlowFile(rows: FlowfileAttributeRowSchema[], file: File) {
    const filename = findFilename(rows, file);

    // TODO: Potentally remove??
    if (rows.filter((x) => x.key === "mime.type").length == 0) {
        rows.push({
            key: "mime.type",
            value: file.type,
        })
    }

    const bytes: number[] = [];

    pushUTF8(bytes, MAGIC_HEADER);

    writeFieldLength(bytes, rows.length);
    for(var i=0; i < rows.length; i++) {
        var row = rows[i];
        writeString(bytes, row.key);
        writeString(bytes, row.value);
    }
    writeLong(bytes, file.size);

    const blob = new Blob([new Uint8Array(bytes), file], {
        type: "application/octet-stream",
    })
    
    return {
        filename: filename + ".pkg",
        blob: blob,
    }
}

export default packageFlowFile;