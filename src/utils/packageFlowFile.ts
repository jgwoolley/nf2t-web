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
    // console.log(new_bytes);
    // console.log(bytes);
    for(let x of new_bytes.entries()) {
        bytes.push(x[1]);
    }
    // console.log(bytes);
}

function findFilename(attributes: FlowfileAttributeRowSchema[], file: File) {    
    for(let index = 0; index < attributes.length; index++) {
        const attribute = attributes[index];
        if(attribute[0] === "filename") {
            return attribute[1];
        }
    }

    return file.name;
}

export function packageFlowFile(attributes: FlowfileAttributeRowSchema[], file: File) {
    const filename = findFilename(attributes, file);
    const bytes: number[] = [];

    pushUTF8(bytes, MAGIC_HEADER);

    writeFieldLength(bytes, attributes.length);
    for(var i=0; i < attributes.length; i++) {
        const row = attributes[i];
        writeString(bytes, row[0]);
        writeString(bytes, row[1]);
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