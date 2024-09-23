import { findCoreAttributes, FLOWFILE_ATTRIBUTES_EXTENSION, FlowFileResult } from "@nf2t/flowfiletools-js";

export type DownloadAllUnpackagedParams = {
    directoryHandle: FileSystemDirectoryHandle, 
    row: FlowFileResult,
}

export async function downloadAttributes({directoryHandle, row}: DownloadAllUnpackagedParams) {
    if(row.status !== "success") return;
    
    const coreAttributes = findCoreAttributes(row.attributes);

    const filename = (coreAttributes.filename || "flowFiles") + FLOWFILE_ATTRIBUTES_EXTENSION;
    const blob = new Blob([JSON.stringify(row.attributes)], {
        type: "application/json",
    })

    const filehandle = await directoryHandle.getFileHandle(filename, {create: true});
    const writable = await filehandle.createWritable();

    await writable.write(blob);
    await writable.close();
}

export async function downloadContent({directoryHandle, row}: DownloadAllUnpackagedParams) {
    if(row.status !== "success") return;

    const coreAttributes = findCoreAttributes(row.attributes);
    const filename = coreAttributes.filename || "flowFiles";

    const filehandle = await directoryHandle.getFileHandle(filename, {create: true});
    const writable = await filehandle.createWritable();

    await writable.write(row.content);
    await writable.close();
}

export async function downloadAllUnpackaged({directoryHandle, rows}: {directoryHandle: FileSystemDirectoryHandle, rows: FlowFileResult[]}) {
    const results = rows.map(row => {
        return Promise.all([
            downloadAttributes({directoryHandle: directoryHandle, row: row, }),
            downloadContent({directoryHandle: directoryHandle, row: row, }),
        ])
    });

    return Promise.all(results)
}

export default downloadAllUnpackaged;