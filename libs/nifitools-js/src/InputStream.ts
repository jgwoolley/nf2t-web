
/**
 * Based on the Java InputStream class.
 */
export class InputStream {
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

    slice(expectedNumBytes: number) {
        const result = this.buffer.slice(this.byteOffset, this.byteOffset + expectedNumBytes);
        this.byteOffset += expectedNumBytes;
        return result;
    }

    hasMoreData() {
        return this.byteOffset < this.buffer.byteLength;
    }
}

export default InputStream;