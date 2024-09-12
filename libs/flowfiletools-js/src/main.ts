export { InputStream } from "./InputStream";
export { packageFlowFiles } from "./packageFlowFiles";
export { unpackageFlowFiles } from "./unpackageFlowFiles";
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
    CoreFlowFileAttributes,
} from "./schemas";

export { updateNf2tAttributes } from "./updateNf2tAttributes";