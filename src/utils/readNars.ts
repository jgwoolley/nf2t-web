import JSZip from "jszip";
import { z } from "zod";

export const NarAttributeTypeSchema = z.enum(["writes", "reads"]);

export type NarAttributeType = z.infer<typeof NarAttributeTypeSchema>;

export const NarAttributeSchema = z.object({
    narId: z.string(),
    extensionId: z.string(),
    type: NarAttributeTypeSchema,
    id: z.string(),
    name: z.string(),
    description: z.string(),
})

export type NarAttribute = z.infer<typeof NarAttributeSchema>;
export const NarAttributesSchema = z.array(NarAttributeSchema);
export type NarAttributes = z.infer<typeof NarAttributesSchema>;

export const NarExtensionSchema = z.object({
    narId: z.string(),
    name: z.string(),
    type: z.string(),
    description: z.string().optional(),
    tags: z.array(z.string()),
    required: z.boolean().optional(),
    sensitive: z.boolean().optional(),
    expressionLanguageSupported: z.boolean().optional(),
    expressionLanguageScope: z.string().optional(),
    dynamicallyModifiesClasspath: z.boolean().optional(),
    dynamic: z.boolean().optional(),
});
export type NarExtension = z.infer<typeof NarExtensionSchema>;
export const NarExtensionsSchema = z.array(NarExtensionSchema);
export type NarExtensions = z.infer<typeof NarExtensionsSchema>;

export const ManifestSchema = z.record(z.string(), z.string());
export type Manifest = z.infer<typeof ManifestSchema>;

export const NarSchema = z.object({
    manifest: ManifestSchema,
    name: z.string(),
    lastModified: z.number(),
    size: z.number(),
    systemApiVersion: z.string().optional(),
    groupId: z.string().optional(),
    artifactId: z.string().optional(),
    version: z.string().optional(),
    buildTag: z.string().optional(),
    buildTimestamp: z.string().optional(),
});

export type Nar = z.infer<typeof NarSchema>;
export const NarsSchema = z.array(NarSchema);
export type Nars = z.infer<typeof NarsSchema>;

export type IncomingFiles = File[];

export type ReadNarsParameters = {
    //TODO: Update implementation of processNars to consume File[] rather than a FileList
    files: IncomingFiles, 
    DOMParser: DOMParser,
    setCurrentProgress: (current: number, total: number) => void,
    parseNar: (nar: Nar) => Promise<void>,
    parseExtension: (extension: NarExtension) => Promise<void>,
    parseAttribute: (extension: NarAttribute) => Promise<void>,
}

type ReadExtensionManifestParameters = {
    file: File, 
    extensionManifest: Document,
    manifest: Manifest,
    parseNar: (nar: Nar) => Promise<void>,
    parseExtension: (extension: NarExtension) => Promise<void>,
    parseAttribute: (extension: NarAttribute) => Promise<void>,
}

type AttributesLuv = {
    type: NarAttributeType,
    selectors: string,
}

const attributesLut: AttributesLuv[] = [
    {
        type: "reads",
        selectors: "readsAttributes > readsAttribute",
    },
    {
        type: "writes",
        selectors: "writesAttributes > writesAttribute",
    },
]

function querySelectorString(element: Document | Element, selectors: string) {
    return element.querySelector(selectors)?.textContent || undefined;
}

function querySelectorBoolean(element: Document | Element, selectors: string) {
    const value = querySelectorString(element, selectors);
    if(value === "true") {
        return true;
    }
    else if(value === "false") {
        return true;
    }
    return undefined;
}

async function readExtensionManifest({file, manifest, extensionManifest, parseNar, parseExtension, parseAttribute }: ReadExtensionManifestParameters) {
    const rawNarInfo: Partial<Nar> = {
        manifest: manifest,
        name: file.name,
        lastModified: file.lastModified,
        size: file.size,
        systemApiVersion: querySelectorString(extensionManifest, "systemApiVersion"),
        groupId: querySelectorString(extensionManifest, "groupId"),
        artifactId: querySelectorString(extensionManifest, "artifactId"),
        version: querySelectorString(extensionManifest, "version"),
        buildTag: querySelectorString(extensionManifest, "buildInfo > tag"),
        buildTimestamp: querySelectorString(extensionManifest, "buildInfo > timestamp"),
    }

    const narResult = await NarSchema.safeParseAsync(rawNarInfo);

    if(!narResult.success) {
        console.error(narResult.error);
        return;
    }

    parseNar(narResult.data);

    for (const extensionElement of extensionManifest.querySelectorAll("extensionManifest > extensions > extension")) {
        const extensionResult = await NarExtensionSchema.safeParseAsync({
            narId: narResult.data.name,
            name: querySelectorString(extensionElement, "name"),
            type: querySelectorString(extensionElement, "type"),
            description: querySelectorString(extensionElement, "description"),
            writesAttributes: [],
            readsAttributes: [],
            tags: [],
            required: querySelectorBoolean(extensionElement, "required"),
            sensitive: querySelectorBoolean(extensionElement, "sensitive"),
            expressionLanguageSupported: querySelectorBoolean(extensionElement, "expressionLanguageSupported"),
            expressionLanguageScope: querySelectorString(extensionElement, "expressionLanguageScope"),
            dynamicallyModifiesClasspath: querySelectorBoolean(extensionElement, "dynamicallyModifiesClasspath"),
            dynamic: querySelectorBoolean(extensionElement, "dynamic"),
        });        

        if (!extensionResult.success) {
            console.error(extensionResult.error);
            continue;
        }

        for(const tagElement of extensionElement.querySelectorAll("tags > tag")) {
            if(tagElement.textContent) {
                extensionResult.data.tags.push(tagElement.textContent);
            }
        }

        parseExtension(extensionResult.data);

        for (const {type, selectors} of attributesLut) {
            const queryResult = extensionElement.querySelectorAll(selectors);

            for (const attributeElement of queryResult) {
                const name = attributeElement.querySelector("name")?.textContent || undefined;

                const rawAttribute: Partial<NarAttribute> = {
                    narId: narResult.data.name,
                    extensionId: extensionResult.data.name,
                    id: `${extensionResult.data.name}|${name}`,
                    type: type,
                    name: name,
                    description: attributeElement.querySelector("description")?.textContent || undefined,
                }

                const attributeResult = await NarAttributeSchema.safeParseAsync(rawAttribute)
                
                if(!attributeResult.success) {
                    console.error(attributeResult.error);
                    continue;
                }

                parseAttribute(attributeResult.data);
            }
        }
    }

    return narResult;
}

export default async function readNars({files, setCurrentProgress, parseNar, parseExtension, parseAttribute, DOMParser}: ReadNarsParameters) {
    const length = files.length;

    for (let index = 0; index < length; index++) {
        setCurrentProgress(index, length);
        const file = files[index];
        if (file == null) {
            continue;
        }
        if (!file.name.endsWith(".nar")) {
            continue;
        }

        await JSZip.loadAsync(file).then(async (zipFile) => {
            //TODO: Actually use manifestFile
            const manifestFile = zipFile.files["META-INF/MANIFEST.MF"];
            const manifestResult = await manifestFile.async("text").then(manifest => {
                return manifest.split("\n").map(line => {
                    const index = line.indexOf(":");
                    return [line.substring(0, index).trim(), line.substring(index + 1).trim()]
                }).filter(x => x[0].length > 0 || x[1].length > 0);
            }).then(Object.fromEntries).then(ManifestSchema.safeParseAsync);

            if(!manifestResult.success) {
                console.error(manifestResult.error);
                return null;
            }

            const extensionManifestFile = zipFile.files["META-INF/docs/extension-manifest.xml"];
            if (extensionManifestFile == undefined) {
                return null;
            }

            return await extensionManifestFile.async("text").then(async (xml) => {
                const extensionManifestFile = DOMParser.parseFromString(xml, "text/xml");
                return await readExtensionManifest({
                    file, 
                    parseNar, 
                    parseExtension, 
                    parseAttribute,
                    manifest: manifestResult.data,
                    extensionManifest: extensionManifestFile,
                });
            })
        });
    }

    setCurrentProgress(length, length);
}