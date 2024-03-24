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
    size: z.number(),
    systemApiVersion: z.string().optional(),
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
export type Nars = Nar[];

export type NarAttributeType = "writesAttributes" | "readsAttributes"

export type NarAttributeLuv = {
    nar_index: number,
    extension_index: number,
    attribute_index: number,
    type: NarAttributeType,
}

export type NarAttributeLur = {
    nar: Nar,
    extension: NarExtension,
    type: string,
    attribute: NarAttribute,
}

export function lookupNarAttribute(nars: Nars, value: NarAttributeLuv) {
    const nar = nars[value.nar_index];
    const extension = nar.extensions[value.extension_index];
    const attributes = extension[value.type];
    const attribute = attributes[value.attribute_index];

    return {
        nar: nar,
        extension: extension,
        type: value.type,
        attribute: attribute,
    };
}

export async function readExtensionManifest(file: File, manifest: Document) {
    const extensions: NarExtension[] = [];

    for (let extension of manifest.querySelectorAll("extensionManifest > extensions > extension")) {
        const extensionInfo = await NarExtensionSchema.safeParseAsync({
            name: manifest.querySelector("name")?.textContent,
            type: manifest.querySelector("type")?.textContent,
            description: manifest.querySelector("description")?.textContent,
            writesAttributes: [],
            readsAttributes: [],
        })

        if (!extensionInfo.success) {
            continue;
        }

        if (extensionInfo.data.type !== "PROCESSOR") {
            continue;
        }

        const attributes = new Map<string, NarAttribute[]>();
        attributes.set("writesAttributes > writesAttribute", extensionInfo.data.writesAttributes);
        attributes.set("readsAttributes > readsAttribute", extensionInfo.data.readsAttributes);

        for (let [attributeKey, attributeValues] of attributes) {
            const queryResult = extension.querySelectorAll(attributeKey)

            for (let attribute of queryResult) {
                const attributeInfo = await NarAttributeSchema.parseAsync({
                    name: attribute.querySelector("name")?.textContent,
                    description: attribute.querySelector("description")?.textContent,
                })

                attributeValues.push(attributeInfo);
            }
        }

        if (extensionInfo.data.writesAttributes.length + extensionInfo.data.readsAttributes.length > 0) {
            extensions.push(extensionInfo.data);
        }
    }

    const rawNarInfo: unknown = {
        name: file.name,
        lastModified: file.lastModified,
        size: file.size,
        systemApiVersion: manifest.querySelector("systemApiVersion")?.textContent,
        groupId: manifest.querySelector("groupId")?.textContent,
        artifactId: manifest.querySelector("artifactId")?.textContent,
        version: manifest.querySelector("version")?.textContent,
        buildTag: manifest.querySelector("buildInfo > tag")?.textContent,
        buildTimestamp: manifest.querySelector("buildInfo > timestamp")?.textContent,
        extensions: extensions,
    }

    const narInfo = NarSchema.safeParseAsync(rawNarInfo);

    return await narInfo;
}

export default async function readNars(files: FileList, setCurrentProgress: (current: number, total: number) => void) {
    const results: Nar[] = [];
    const parser = new DOMParser();
    const length = files.length;

    for (let index = 0; index < length; index++) {
        setCurrentProgress(index, length);
        const file = files.item(index);
        if (file == null) {
            continue;
        }
        if (!file.name.endsWith(".nar")) {
            continue;
        }

        const narInfo = await JSZip.loadAsync(file).then(async (zipFile) => {
            //TODO: Actually use manifestFile
            const manifestFile = zipFile.files["META-INF/MANIFEST.MF"];
            manifestFile.async("text").then(manifest => {
                return manifest.split("\n").map(line => {
                    const index = line.indexOf(":");
                    return [line.substring(0, index).trim(), line.substring(index + 1).trim()]
                }).filter(x => x[0].length > 0 || x[1].length > 0);
            });

            const extensionManifestFile = zipFile.files["META-INF/docs/extension-manifest.xml"];
            if (extensionManifestFile == undefined) {
                return null;
            }
            return await extensionManifestFile.async("text").then(async (xml) => {
                const extensionManifestFile = parser.parseFromString(xml, "text/xml");
                return await readExtensionManifest(file, extensionManifestFile);
            })
        });

        if (narInfo == null) {
            console.error("null");
            continue;
        }

        if (!narInfo.success) {
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

export type NarAttributeLut = Map<string, NarAttributeLuv[]>;

export function createAttributeLut(attributes: NarAttributeLut, extension: NarExtension, type: NarAttributeType, nar_index: number, extension_index: number) {
    extension[type].forEach((attribute, attribute_index) => {
        if (attribute.name == undefined) {
            return;
        }

        let values = attributes.get(attribute.name);
        if (values == undefined) {
            values = [];
            attributes.set(attribute.name, values);
        }

        values.push({
            nar_index: nar_index,
            extension_index: extension_index,
            attribute_index: attribute_index,
            type: type,
        })
    });
}