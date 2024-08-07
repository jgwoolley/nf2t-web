import { GenerateFile } from "vite-plugin-generate-file";
import JSZip from "jszip";
import { readFile } from "fs/promises";
import readNars, { NarAttributes, NarExtensions, Nars } from "../src/utils/readNars";
import { JSDOM } from "jsdom";

export default async function generateNarJson(): Promise<GenerateFile> {
    const DOMParser = new new JSDOM().window.DOMParser();

    const data = await readFile("downloads/nifi-1.27.0-bin.zip").then(data => {
        console.log(data);
        return JSZip.loadAsync(data);
    }).then(async (zipFile) => {
        const files = await Promise.all(zipFile.filter(x => x.endsWith(".nar")).map(async x => {
            const blob = await x.async("blob")
            return new File([blob], x.name);
        }));

        const nars: Nars = [];
        const extensions: NarExtensions = [];
        const attributes: NarAttributes = [];

        await readNars({
            files, 
            setCurrentProgress: () => {

            }, 
            parseNar: async (nar) => {
                nars.push(nar);
            }, 
            parseExtension: async (extension) => {
                extensions.push(extension)
            }, 
            parseAttribute: async (attribute) => {
                attributes.push(attribute)
            }, 
            DOMParser: DOMParser,
        });

        return {
            success: false,
            nars: nars,
            extensions: extensions,
            attributes: attributes,
        };
    }).catch((e) => {
        console.error(e);
        return {
            success: false,
            error: e,
        }
    });

    return {
        type: 'json',
        output: './nars.json',
        data: data,
    }
}
