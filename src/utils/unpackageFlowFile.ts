import { FlowfileAttributesSchema } from "./schemas";

export type UnpackageResult = {
    attributes: FlowfileAttributesSchema,
    content: ArrayBuffer,
}

const MAGIC_HEADER = 'NiFiFF3';

// TODO: This really isn't an inputstream, I just stole the name from Java.
class InputStream {
    private buffer: ArrayBuffer;
    private view: DataView;
    public byteOffset: number;

    constructor(buffer: ArrayBuffer) {
        this.buffer = buffer;
        this.view = new DataView(buffer);
        this.byteOffset = 0;
    } 

    getUint8() {
        const val = this.view.getUint8(this.byteOffset);
        this.byteOffset++;
        return val;
    }

    assertUint8(expected: number) {
        const actual = this.getUint8();
        if(expected !== actual) {
            throw new Error(`Expected ${expected} at byte ${this.byteOffset - 1}: Actual ${actual}`);
        }
    }

    getEnd() {
        return this.buffer.slice(this.byteOffset);
    }
}

function readFieldLength(view: InputStream) {
    const firstValue = view.getUint8();
    const secondValue = view.getUint8();
    if(firstValue < 0) {
        return null;
    } else if(secondValue < 0) {
        throw new Error("Not in FlowFile-v3 format: End Of File");
    } else if (firstValue == 0xff && secondValue == 0xff) {
        const ch1 = view.getUint8();
        const ch2 = view.getUint8();
        const ch3 = view.getUint8();
        const ch4 = view.getUint8();
        if ((ch1 | ch2 | ch3 | ch4) < 0) {
            throw new Error("Not in FlowFile-v3 format: End Of File");
        }

        return ((ch1 << 24) + (ch2 << 16) + (ch3 << 8) + (ch4));
    } else {
        return ((firstValue << 8) + (secondValue));
    }
}

function readString(view: InputStream) {
    const numBytes = readFieldLength(view);
    if (numBytes == null) {
        throw new Error("Not in FlowFile-v3 format: End Of File");
    }
    const bytes: number[] = [];
    fillBuffer(view, bytes, numBytes);

    return String.fromCharCode.apply(null, bytes);
}

function fillBuffer(view: InputStream, bytes: number[], length: number) {
    for(let i = 0; i < length; i++) {
        const val = view.getUint8();
        bytes[i] = val;
    }
}

function readAttributes(view: InputStream): FlowfileAttributesSchema | null {
    const attributes: FlowfileAttributesSchema = {};
    const numAttributes = readFieldLength(view);
    if (numAttributes == null) {
        return null;
    }
    if (numAttributes == 0) {
        throw new Error("Not in FlowFile-v3 format: FlowFiles cannot have zero attributes");
    }
    // console.log(`Found ${numAttributes} attribute(s).`);
    for (let i = 0; i < numAttributes; i++) { //read each attribute key/value pair
        const key = readString(view);
        const value = readString(view);
        attributes[key] = value;
    }

    return attributes;
}

function readLong(view: InputStream) {
    return (
        (view.getUint8() << 56) +
        ((view.getUint8() & 255) << 48) +
        ((view.getUint8() & 255) << 40)  +
        ((view.getUint8() & 255) << 32) +
        ((view.getUint8() & 255) << 24) +
        ((view.getUint8() & 255) << 16) +
        ((view.getUint8() & 255) << 8) +
        ((view.getUint8() & 255))
    )

}

export function unpackageFlowFile(buffer: ArrayBuffer): UnpackageResult | null {
    const view = new InputStream(buffer);

    for(let i = 0; i < MAGIC_HEADER.length; i++) {
        const expected = MAGIC_HEADER.charCodeAt(i);
        view.assertUint8(expected);
    }
    const attributes = readAttributes(view);
    if(attributes == undefined) {
        return null;
    }
    // console.log(Object.fromEntries(attributes.entries()));
    const expectedNumBytes = readLong(view);
    // console.log({expectedNumBytes: expectedNumBytes});
    const content = view.getEnd();
    // console.log({byteLength: content.byteLength});
    if(content.byteLength !== expectedNumBytes) {
        throw new Error(`Not in FlowFile-v3 format: Expected bytes (${expectedNumBytes}) != (${content.byteLength})`);
    }
    
    return {attributes, content};
}

export default unpackageFlowFile;
