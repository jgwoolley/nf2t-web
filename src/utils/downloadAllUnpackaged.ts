import { FlowfileAttributesSchema } from "./schemas";
import unpackageFlowFile from "./unpackageFlowFile";

export type BulkUnpackageRow = {
    attributes: FlowfileAttributesSchema,
    file: File,
}

type DownloadAllUnpackagedParams = {
    directoryHandle: FileSystemDirectoryHandle, 
    row: BulkUnpackageRow,
}

export async function downloadAttributes({directoryHandle, row}: DownloadAllUnpackagedParams) {
    const filename = (row.attributes["filename"] || row.file.name ) + ".attributes.json";
    const blob = new Blob([JSON.stringify(row.attributes)], {
        type: "application/json",
    })

    const filehandle = await directoryHandle.getFileHandle(filename, {create: true});
    const writable = await filehandle.createWritable();

    await writable.write(blob);
    await writable.close();
}

export async function downloadContent({directoryHandle, row}: DownloadAllUnpackagedParams) {
    const filename = row.attributes["filename"] || row.file.name;
    const content = unpackageFlowFile(await row.file.arrayBuffer());
    if(content == undefined) {
        return;
    }

    const blob = new Blob([content.content], {
        type: row.attributes["mime.type"],
    })

    const filehandle = await directoryHandle.getFileHandle(filename, {create: true});
    const writable = await filehandle.createWritable();

    await writable.write(blob);
    await writable.close();
}

export default async function downloadAllUnpackaged({directoryHandle, rows}: {directoryHandle: FileSystemDirectoryHandle, rows: BulkUnpackageRow[]}) {
    const results = rows.map(row => {
        return Promise.all([
            downloadAttributes({directoryHandle: directoryHandle, row: row, }),
            downloadContent({directoryHandle: directoryHandle, row: row, }),
        ])
    });

    return Promise.all(results)
}