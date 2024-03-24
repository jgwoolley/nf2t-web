import JSZip from "jszip";
import { z } from "zod";

export const NarAttributeSchema = z.object({
    name: z.string(),
    description: z.string(),
})

export const NarExtensionSchema = z.object({
    name: z.string(),
    type: z.string(),
    description: z.string().optional(),
    writesAttributes: z.array(NarAttributeSchema),
    readsAttributes: z.array(NarAttributeSchema),
});

export const NarSchema = z.object({
    name: z.string(),
    lastModified: z.number(),
    groupId: z.string().optional(),
    artifactId: z.string().optional(),
    version: z.string().optional(),
    buildTag: z.string().optional(),
    buildTimestamp: z.string().optional(),
    extensions: z.array(NarExtensionSchema),
});

export type NarAttribute = z.infer<typeof NarAttributeSchema>;
export type NarExtension = z.infer<typeof NarExtensionSchema>;
export type Nar = z.infer<typeof NarSchema>;

export type NarAttributeType = "writesAttributes" | "readsAttributes"

export type NarAttributeLuv = {
    nar_index: number,
    extension_index: number,
    attribute_index: number,
    type: NarAttributeType,
}

export function lookupNarAttribute(nars: Nar[], value: NarAttributeLuv) {
    const nar = nars[value.nar_index];
    const extension = nar.extensions[value.extension_index];
    const attributes = extension[value.type];
    const attribute = attributes[value.attribute_index];

    return attribute;
}

export async function readManifest(file: File, manifest: Document) {
    const extensions: NarExtension[] = [];

    for(let extension of manifest.querySelectorAll("extensionManifest > extensions > extension")) {        
        const extensionInfo = await NarExtensionSchema.safeParseAsync({
            name: manifest.querySelector("name")?.textContent,
            type: manifest.querySelector("type")?.textContent,
            description: manifest.querySelector("description")?.textContent,
            writesAttributes: [],
            readsAttributes: [],
        })

        if(!extensionInfo.success) {
            continue;
        }

        if(extensionInfo.data.type !== "PROCESSOR") {
            continue;
        }

        const attributes = new Map<string, NarAttribute[]>();
        attributes.set("writesAttributes > writesAttribute", extensionInfo.data.writesAttributes);
        attributes.set("readsAttributes > readsAttribute", extensionInfo.data.readsAttributes);

        for(let [attributeKey, attributeValues] of attributes) {
            const queryResult = extension.querySelectorAll(attributeKey)

            for(let attribute of queryResult) {
                const attributeInfo = await NarAttributeSchema.parseAsync({
                    name: attribute.querySelector("name")?.textContent,
                    description: attribute.querySelector("description")?.textContent,
                })

                attributeValues.push(attributeInfo);
            }
        }

        if(extensionInfo.data.writesAttributes.length + extensionInfo.data.readsAttributes.length > 0) {
            extensions.push(extensionInfo.data);
        }
    }

    const narInfo = NarSchema.safeParseAsync({
        name: file.name,
        lastModified: file.lastModified,
        groupId: manifest.querySelector("extensionManifest > groupId")?.textContent,
        artifactId: manifest.querySelector("extensionManifest > artifactId")?.textContent,
        version: manifest.querySelector("extensionManifest > version")?.textContent,
        buildTag: manifest.querySelector("extensionManifest > buildInfo > tag")?.textContent,
        buildTimestamp: manifest.querySelector("extensionManifest > buildInfo > timestamp")?.textContent,
        extensions: extensions,
    })

    return await narInfo;
}

export default async function readNars(files: FileList, setCurrentProgress: (current: number, total: number) => void) {
    const results: Nar[] = [];
    const parser = new DOMParser();
    const length = files.length;

    for(let index = 0; index < length; index++) {
        setCurrentProgress(index, length);
        const file = files.item(index);
        if(file == null) {
            continue;
        }
        if(!file.name.endsWith(".nar")) {
            continue;
        }

        const narInfo = await JSZip.loadAsync(file).then(async (zipFile) => {
            const manifestFile = zipFile.files["META-INF/docs/extension-manifest.xml"];
            if(manifestFile == undefined) {
                return null;
            }
            return await manifestFile.async("text").then(async (xml) => {
                const manifest = parser.parseFromString(xml, "text/xml");
                return await readManifest(file, manifest);
            }) 
        });

        if(narInfo == null) {
            console.error("null");
            continue;
        }
        
        if(!narInfo.success) {
            console.error(narInfo.error);
            continue;
        }
        if (narInfo.data.extensions.length > 0) {
            results.push(narInfo.data);
            continue;
        }
    }

    return results;
}