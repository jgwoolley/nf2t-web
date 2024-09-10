
export const coreAttributes = new Map<string, string>([
    ["path", "The FlowFile's path indicates the relative directory to which a FlowFile belongs and does not contain the filename."],
    ["absolute.path", "The FlowFile's absolute path indicates the absolute directory to which a FlowFile belongs and does not contain the filename."],
    ["filename", "The filename of the FlowFile. The filename should not contain any directory structure."],
    ["uuid", "A unique UUID assigned to this FlowFile."],
    ["priority", "A numeric value indicating the FlowFile priority."],
    ["mime.type", "The MIME Type of this FlowFile."],
    ["discard.reason", "Specifies the reason that a FlowFile is being discarded."],
    ["alternate.identifier", "Indicates an identifier other than the FlowFile's UUID that is known to refer to this FlowFile."],
]);