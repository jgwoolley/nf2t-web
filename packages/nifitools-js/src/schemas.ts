export type CoreAttributeNames = 
    "path" |
    "absolute.path" |
    "filename" |
    "uuid" |
    "priority" |
    "mime.type" |
    "discard.reason" |
    "alternate.identifier";


export type AttributeSpecification<K extends string> = {
    key: K,
    description: string,
}

export type AttributeSpecifications<K extends string> = Record<K, AttributeSpecification<K>>

export const CORE_ATTRIBUTES: AttributeSpecifications<CoreAttributeNames> = {
    "path": {
        "key": "path",
        "description": "The FlowFile's path indicates the relative directory to which a FlowFile belongs and does not contain the filename.",
    },
    "absolute.path": {
        "key": "absolute.path",
        "description": "The FlowFile's absolute path indicates the absolute directory to which a FlowFile belongs and does not contain the filename.",
    },
    "filename": {
        "key": "filename",
        "description": "The filename of the FlowFile. The filename should not contain any directory structure.",
    },
    "uuid": {
        "key": "uuid",
        "description": "A unique UUID assigned to this FlowFile.",
    },
    "priority": {
        "key": "priority",
        "description": "A numeric value indicating the FlowFile priority",
    },
    "mime.type": {
        "key": "mime.type",
        "description": "The MIME Type of this FlowFile.",
    },
    "discard.reason": {
        "key": "discard.reason",
        "description": "Specifies the reason that a FlowFile is being discarded.",
    },
    "alternate.identifier": {
        "key": "alternate.identifier",
        "description": "Indicates an identifier other than the FlowFile's UUID that is known to refer to this FlowFile.",
    },
}

/**
 * @see https://github.com/apache/nifi/blob/821e5d23c9d090c85986be00160269f35bc4a246/nifi-api/src/main/java/org/apache/nifi/flowfile/attributes/CoreAttributes.java
 */
export type Nf2tAttributeNames = 
    "filename" |
    "mime.type" |
    "lastModified" |
    "uploadTime" |
    "size" |
    "content.sha256";

export const NF2T_ATTRIBUTES: AttributeSpecifications<Nf2tAttributeNames> = {
    filename: {
        key: "filename",
        description: "The filename of FlowFile's content, as determined by the browser.",
    },
    "mime.type": {
        key: "mime.type",
        description: "The mimetype of FlowFile's content, as determined by the browser.",
    },
    lastModified: {
        key: "lastModified",
        description: "When the FlowFile's content was last modified, as determined by the browser.",
    },
    uploadTime: {
        key: "uploadTime",
        description: "When the FlowFile's content was uploaded, as determined by the browser.",
    },
    size: {
        key: "size",
        description: "File size of FlowFile's content, as calculated by Nf2t within the browser.",
    },
    "content.sha256": {
        key: "content.sha256",
        description: "A SHA256 of the FlowFile's content, as determined by the browser.",
    }
}

/**
 * @see https://github.com/apache/nifi/blob/main/nifi-commons/nifi-utils/src/main/java/org/apache/nifi/flowfile/attributes/StandardFlowFileMediaType.java
 */
export const FLOWFILE_MEDIA_TYPES = {
    UNSPECIFIED: "application/flowfile",
    1: "application/flowfile-v1",
    2: "application/flowfile-v2",
    3: "application/flowfile-v3",
} as const;

export const FLOWFILE_EXTENSION = ".pkg";
export const FLOWFILE_ATTRIBUTES_EXTENSION = ".attributes.json";

export const MAGIC_HEADER = 'NiFiFF3';
export const MAX_VALUE_2_BYTES = 65535;


export type FlowFileAttribute = [string, string];
export type FlowFileAttributes = FlowFileAttribute[];
export type FlowFileContent = File | Blob;

export type FlowFile = {
    attributes: FlowFileAttributes,
    content: FlowFileContent,
}


export function isCoreAttribute(key: string): key is CoreAttributeNames {
    return key in CORE_ATTRIBUTES;
}

export function isNf2tAttribute(key: string): key is Nf2tAttributeNames {
    return key in NF2T_ATTRIBUTES;
}

export type CoreFlowFileAttributes = Partial<Record<CoreAttributeNames, string> & Record<Nf2tAttributeNames, string> & Record<string, string>>;

export function findCoreAttributes(attributes: FlowFileAttributes): CoreFlowFileAttributes {
    const result: CoreFlowFileAttributes = { };
    for(const [attributeKey, attributeValue] of attributes) {
        result[attributeKey] = attributeValue;
    }

    return result;
}