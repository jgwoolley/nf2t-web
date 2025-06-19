export { InputStream } from "./InputStream";
export { packageFlowFileStream } from "./packageFlowFileStream";
export { unpackageFlowFileStream } from "./unpackageFlowFileStream";
export { 
    CORE_ATTRIBUTES,
    NF2T_ATTRIBUTES,
    FLOWFILE_MEDIA_TYPES,
    FLOWFILE_EXTENSION,
    FLOWFILE_ATTRIBUTES_EXTENSION,
    MAGIC_HEADER,
    isCoreAttribute,
    getCoreAttribute,
    isNf2tAttribute,
    getNf2tAttribute,
    findCoreAttributes,
} from "./schemas";

export type { 
    CoreAttributeNames,
    AttributeSpecification,
    AttributeSpecifications,
    Nf2tAttributeNames,
    FlowFileAttribute,
    FlowFileAttributes,
    FlowFileContent,
    FlowFile,
    FlowFileResults,
    CoreFlowFileAttributes,
} from "./schemas";

export { updateNf2tAttributes } from "./updateNf2tAttributes";