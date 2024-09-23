import { FlowFileAttributes, FlowFile, MAGIC_HEADER, findCoreAttributes, CoreFlowFileAttributes, FlowFileContent, FlowFileResult } from "./schemas";
import InputStream from "./InputStream";

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

function readAttributes(view: InputStream): FlowFileAttributes {
    const attributes: FlowFileAttributes = [];
    const numAttributes = readFieldLength(view);
    if (numAttributes == null) {
        return attributes;
    }
    if (numAttributes == 0) {
        throw new Error("Not in FlowFile-v3 format: FlowFiles cannot have zero attributes");
    }
    
    //read each attribute key/value pair
    for (let i = 0; i < numAttributes; i++) { 
        const key = readString(view);
        const value = readString(view);
        attributes.push([key, value]);
    }

    return attributes;
}

function readLong(view: InputStream): number {
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

function createContent(coreAttributes: CoreFlowFileAttributes, content: ArrayBuffer): FlowFileContent {
    const filename = coreAttributes.filename;
    const mimetype = coreAttributes["mime.type"];
    if(filename) {
        return new File([content], filename, {
            //TODO: Add LastModified
            lastModified: undefined,
            type: mimetype,
        })
    }

    return new Blob([content], {
        type: mimetype,
    })
}

function unpackageFlowFile(view: InputStream): FlowFileResult {
    try {
        for(let i = 0; i < MAGIC_HEADER.length; i++) {
            const expected = MAGIC_HEADER.charCodeAt(i);
            view.assertUint8(expected);
        }
        const attributes = readAttributes(view);
        const expectedNumBytes = readLong(view);
        const content = view.slice(expectedNumBytes);
        
        const coreAttributes = findCoreAttributes(attributes);

        const flowFile: FlowFile = {
            status: "success",
            attributes: attributes, 
            content: createContent(coreAttributes, content),
        }

        return flowFile;
    } catch(error) {
        return {
            status: "error",
            error: error,
        }
    }
}

/**
 * 
 * @param buffer 
 * @returns 
 * 
 * @see https://github.com/apache/nifi/blob/821e5d23c9d090c85986be00160269f35bc4a246/nifi-commons/nifi-flowfile-packager/src/main/java/org/apache/nifi/util/FlowFileUnpackagerV3.java
 * @see https://github.com/apache/nifi/blob/821e5d23c9d090c85986be00160269f35bc4a246/nifi-extension-bundles/nifi-hadoop-bundle/nifi-hdfs-processors/src/main/java/org/apache/nifi/processors/hadoop/FlowFileStreamUnpackerSequenceFileWriter.java
 */
export function unpackageFlowFileStream(buffer: ArrayBuffer): FlowFileResult[] {
    const results: FlowFileResult[] = [];

    const view = new InputStream(buffer);

    while(view.hasMoreData()) {
        const flowFile = unpackageFlowFile(view);
        results.push(flowFile);
    }

    return results;
}

export default unpackageFlowFileStream;
