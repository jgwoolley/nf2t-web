import { readNars, WriteNars, WriteNarsSchema } from "@nf2t/nifitools-js";
import { JSDOM } from "jsdom";
import { readdirSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { open } from "node:fs/promises";
import child_process from "child_process";

const DOWNLOADS_PATH = "./downloads";
const ZIP_PATH = `${DOWNLOADS_PATH}/nifi.zip`;
const CACHE_PATH = `${DOWNLOADS_PATH}/cache`;
const NARS_PATH = "./nars";

async function generateNarsNew() {
    const DOMParser = new new JSDOM().window.DOMParser();

    const narInfo: WriteNars = {
        nars: [],
        extensions: [],
        attributes: []
    };
    const files = readdirSync(NARS_PATH).map(async (x) => {
        const fileHandle = await open(`${NARS_PATH}/${x}`);
        const buffer = await fileHandle.readFile();
        const file = new File([buffer], x);
        fileHandle.close();

        return file;
    });

    const results = await readNars({
        files: await Promise.all(files), 
        setCurrentProgress: (current, total) => {
            return null;
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

export async function generateNars(): Promise<WriteNars> {
    const cacheExists = existsSync(CACHE_PATH);
    console.log(`Cache Exists? ${cacheExists ? "true": "false"}`)
    if (cacheExists) {
        const content = readFileSync(CACHE_PATH, {
            encoding: "utf8",
        });
        return WriteNarsSchema.parseAsync(JSON.parse(content));
    }

    const narsExists = existsSync(NARS_PATH);
    console.log(`Nars Directory Exists? ${narsExists ? "true": "false"}`)

    if (!narsExists) {
        mkdirSync(NARS_PATH);

        const downloadsExists = existsSync(DOWNLOADS_PATH);
        console.log(`Download Directory Exists? ${downloadsExists ? "true": "false"}`)

        if (!downloadsExists){
            mkdirSync(DOWNLOADS_PATH);
        }

        const zipExists = existsSync(ZIP_PATH);
        console.log(`Zip Directory Exists? ${zipExists ? "true": "false"}`)

        if (!zipExists){
            console.log("Download NiFi");
            child_process.execSync(`curl https://dlcdn.apache.org/nifi/1.27.0/nifi-1.27.0-bin.zip -o ${ZIP_PATH}`);
        }

        console.log("UnZip NiFi");
        child_process.execSync(`unzip ${ZIP_PATH} '*/*.nar' -d ${DOWNLOADS_PATH}/`);

        console.log("Copy NiFi Nars");
        child_process.execSync(`cp ${DOWNLOADS_PATH}/nifi-1.27.0/lib/*.nar ${NARS_PATH}`);
    }

    const narInfo = await generateNarsNew();
    const narInfoJson = JSON.stringify(narInfo);
    writeFileSync(CACHE_PATH, narInfoJson);

    return narInfo;
}

export default generateNars;