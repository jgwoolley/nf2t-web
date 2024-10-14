import { MAGIC_HEADER, MAX_VALUE_2_BYTES, FLOWFILE_MEDIA_TYPES, findCoreAttributes, FLOWFILE_EXTENSION, FlowFileResult } from "./schemas";

/**
 * 
 * @see https://www.youtube.com/watch?v=y112ifgOsW0
 * 
 * @param bytes 
 * @param text 
 */
function pushUTF8(bytes: number[], text: string) {
    for(let i=0; i < text.length; i++) {
        const charcode = text.charCodeAt(i);
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
    for(let i=0; i < new_bytes.length; i++) {
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
    for(const x of new_bytes.entries()) {
        bytes.push(x[1]);
    }
}

export type PackageFlowFilesOptions = {
    addNf2tAttributes?: boolean,
}

/**
 * 
 * @param attributes 
 * @param file 
 * @returns 
 * 
 * @see https://github.com/apache/nifi/blob/821e5d23c9d090c85986be00160269f35bc4a246/nifi-commons/nifi-flowfile-packager/src/main/java/org/apache/nifi/util/FlowFilePackagerV3.java
 */
export function packageFlowFileStream(flowFiles: FlowFileResult[]): File {
    // TODO: Maybe just always give it the same filename...
    let filename : string | null = null;
    const blobParts: BlobPart[] = [];

    for(const flowFile of flowFiles) {
        if(flowFile.status !== "success") continue;
        const coreAttributes = findCoreAttributes(flowFile.attributes);
        if(filename == undefined && coreAttributes.filename) {
            filename = coreAttributes.filename;
        }

        const bytes: number[] = [];

        pushUTF8(bytes, MAGIC_HEADER);

        writeFieldLength(bytes, flowFile.attributes.length);
        for(let i=0; i < flowFile.attributes.length; i++) {
            const row = flowFile.attributes[i];
            writeString(bytes, row[0]);
            writeString(bytes, row[1]);
        }
        writeLong(bytes, flowFile.content.size);
        blobParts.push(new Uint8Array(bytes));
        blobParts.push(flowFile.content);
    }

    if(filename == undefined) {
        filename = "flowFiles";
    }

    const blob = new File(blobParts, filename + FLOWFILE_EXTENSION, {
        type: FLOWFILE_MEDIA_TYPES[3],
    })
    
    return blob;
}

export default packageFlowFileStream;