import { CORE_ATTRIBUTES, findCoreAttributes, FlowFile, FlowFileAttributes, NF2T_ATTRIBUTES } from "./schemas";

function convertDate(date: Date): string {
    return date.toISOString();
}

export function updateNf2tAttributes(flowFiles: FlowFile[], defaultAttributes?: FlowFileAttributes) {
    const uploadTime = convertDate(new Date());
    if(defaultAttributes == undefined) {
        defaultAttributes = [];
    }

    for(const flowFile of flowFiles) {
        const coreAttributes = findCoreAttributes(flowFile.attributes);

        for(const attribute of defaultAttributes) {
            if(coreAttributes[attribute[0]] == undefined) {
                flowFile.attributes.push(attribute);
            }
        }

        if(coreAttributes.size == undefined) {
            flowFile.attributes.push([NF2T_ATTRIBUTES.size.key, flowFile.content.size.toString()]);
        }

        if(coreAttributes["mime.type"] == undefined && flowFile.content.type.length > 0) {
            flowFile.attributes.push([CORE_ATTRIBUTES["mime.type"].key, flowFile.content.type]);
        }

        if(coreAttributes["uploadTime"] == undefined) {
            flowFile.attributes.push([NF2T_ATTRIBUTES.uploadTime.key, uploadTime]);
        }

        if(flowFile.content instanceof File) {
            if(coreAttributes.filename == undefined) {
                flowFile.attributes.push([CORE_ATTRIBUTES.filename.key, flowFile.content.name]);
            }

            if(coreAttributes.lastModified == undefined) {
                const lastModified = new Date(0);
                lastModified.setUTCMilliseconds(flowFile.content.lastModified);
                console.log(lastModified);
                flowFile.attributes.push([NF2T_ATTRIBUTES.lastModified.key, convertDate(lastModified)]);
            }
        }
    }
}