import { readNars, WriteNars } from "@nf2t/nifitools-js";
import { JSDOM } from "jsdom";
import { readdirSync } from "fs";
import { open } from "node:fs/promises";

export async function generateNars() {
    const DOMParser = new new JSDOM().window.DOMParser();

    const narInfo: WriteNars = {
        nars: [],
        extensions: [],
        attributes: []
    };
    const files = readdirSync("./nars").map(async (x) => {
        const fileHandle = await open(`./nars/${x}`);
        const buffer = await fileHandle.readFile();
        const file = new File([buffer], x);
        fileHandle.close();

        return file;
    });

    const results = await readNars({
        files: await Promise.all(files), 
        setCurrentProgress: (current, total) => {
            console.log({current, total});
        }, 
        parseNar: async (nar) => {
            narInfo.nars.push(nar);
        }, 
        parseExtension: async (extension) => {
            narInfo.extensions.push(extension);
        }, 
        parseAttribute: async (attribute) => {
            narInfo.attributes.push(attribute);
        }, 
        DOMParser: DOMParser,
    });

    console.log(results);

    return narInfo;
}

export default generateNars;