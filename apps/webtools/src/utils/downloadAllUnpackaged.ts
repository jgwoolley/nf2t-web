import { findCoreAttributes, FlowFile, FLOWFILE_ATTRIBUTES_EXTENSION } from "@nf2t/flowfiletools-js";

export type DownloadAllUnpackagedParams = {
    directoryHandle: FileSystemDirectoryHandle, 
    row: FlowFile,
}

export async function downloadAttributes({directoryHandle, row}: DownloadAllUnpackagedParams) {
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
    const coreAttributes = findCoreAttributes(row.attributes);
    const filename = coreAttributes.filename || "flowFiles";

    const filehandle = await directoryHandle.getFileHandle(filename, {create: true});
    const writable = await filehandle.createWritable();

    await writable.write(row.content);
    await writable.close();
}

export async function downloadAllUnpackaged({directoryHandle, rows}: {directoryHandle: FileSystemDirectoryHandle, rows: FlowFile[]}) {
    const results = rows.map(row => {
        return Promise.all([
            downloadAttributes({directoryHandle: directoryHandle, row: row, }),
            downloadContent({directoryHandle: directoryHandle, row: row, }),
        ])
    });

    return Promise.all(results)
}

export default downloadAllUnpackaged;