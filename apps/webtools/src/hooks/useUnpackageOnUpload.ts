import { AlertColor } from "@mui/material";
import { FlowFileResult, unpackageFlowFileStream } from "@nf2t/flowfiletools-js";
import { ChangeEvent, DragEvent, useCallback } from "react";
import untar from "../utils/untar";
import { UnpackagedFile } from "../utils/schemas";

// TODO: Move this method back to its component BulkUnpackager

export type UseUnpackageOnUploadParams = {
    resetProgress: () => void,
    submitSnackbarMessage: (message: string, type: AlertColor, data?: unknown) => void,
    setCurrent: (value: React.SetStateAction<number | undefined>) => void,
    setTotal: (value: React.SetStateAction<number | undefined>) => void,
    unpackagedRows: FlowFileResult[],
    setUnpackagedRows: React.Dispatch<React.SetStateAction<FlowFileResult[]>>,
    unpackagedFiles: UnpackagedFile[], 
    setUnpackagedFiles: React.Dispatch<React.SetStateAction<UnpackagedFile[]>>,
}

export type UseUnpackageOnUploadResults = {
    onUpload: React.ChangeEventHandler<HTMLInputElement>,
    dragOverProps: {
        onDragOver: React.DragEventHandler<HTMLDivElement>,
        onDragEnter: React.DragEventHandler<HTMLDivElement>,
        onDragExit: React.DragEventHandler<HTMLDivElement>,
        onDragLeave: React.DragEventHandler<HTMLDivElement>,
        onDrop: React.DragEventHandler<HTMLDivElement>,
    }
}

function generateId(file: File): string {
    if(crypto?.randomUUID) {
        return crypto.randomUUID();
    }

    return new Date().toISOString() + file.name;
}

export type ParseFilesParameters = {
    unpackagedFiles: UnpackagedFile[], 
    unpackagedRows: FlowFileResult[],
    files: FileList,
}

/**
 * 
 * @see https://codesandbox.io/p/sandbox/crazy-butterfly-4c2ehe
 * @see https://github.com/mui/material-ui/issues/33898
 */
export function useUnpackageOnUpload({ resetProgress, submitSnackbarMessage, setCurrent, setTotal, setUnpackagedRows, unpackagedRows, unpackagedFiles, setUnpackagedFiles}: UseUnpackageOnUploadParams): UseUnpackageOnUploadResults {
    const parseFiles = useCallback(async ({files, unpackagedFiles, unpackagedRows}: ParseFilesParameters) => {
        try {
            resetProgress();

            if (files === null || files.length < 1) {
                submitSnackbarMessage(`At least one FlowFile should be provided: ${files?.length}.`, "error")
                return;
            }
            setCurrent(0);
            setTotal(files.length);

            const newRows: FlowFileResult[] = [];
            const newUnpackagedFiles: UnpackagedFile[] = [];
            console.log(`Starting to process ${files.length} file(s).`)

            for (let fileIndex = 0; fileIndex < files.length; fileIndex++) {
                setCurrent(fileIndex);
                setTotal(files.length);
                const file = files[fileIndex];

                const parseFlowFileStream = async (file: File, parentId?: string) => {
                    const id = generateId(file);

                    newUnpackagedFiles.push({
                        parentId: parentId,
                        id: id,
                        name: file.name,
                        size: file.size,
                        type: file.type,
                        storageMethod: "Content Not Available",
                    });

                    try {
                        const result = unpackageFlowFileStream(await file.arrayBuffer(), id);
                        result.forEach(x => {
                            newRows.push(x);
                        })
                    } catch (error) {
                        newRows.push({
                            status: "error",
                            parentId: id,
                            error: error,
                        });
                    }
                }

                if (file.name.endsWith(".tar.gz")) {
                    const parentId = generateId(file);
                    newUnpackagedFiles.push({
                        parentId: undefined,
                        id: parentId,
                        name: file.name,
                        size: file.size,
                        type: file.type,
                        storageMethod: "Content Not Available",
                    });

                    const files = await untar(file);
                    for (const file of files) {
                        await parseFlowFileStream(file, parentId);
                    }

                } else if(file.type === "application/zip" || file.name.endsWith(".zip")) {
                    console.error("Cannot parse ZIP.", "error");
                    const parentId = generateId(file);
                    newUnpackagedFiles.push({
                        parentId: undefined,
                        id: parentId,
                        name: file.name,
                        size: file.size,
                        type: file.type,
                        storageMethod: "Content Not Available",
                    });
                }
                else {
                    await parseFlowFileStream(file);
                }
            }

            setCurrent(files.length);
            setTotal(files.length);
            setUnpackagedRows([...unpackagedRows, ...newRows]);
            setUnpackagedFiles([...unpackagedFiles, ...newUnpackagedFiles]);
            submitSnackbarMessage(`Unpackaged ${newUnpackagedFiles.length} file(s) into ${newRows.filter(x => x.status === "success").length} FlowFile(s).`, "success", {
                "files.length": files.length,
                "newRows.length": newRows.length,
                "unpackagedRows.length": unpackagedRows.length,
                "newUnpackagedFiles.length": newUnpackagedFiles.length,
                "unpackagedFiles.length": unpackagedFiles.length,
            });
        } catch (error) {
            submitSnackbarMessage("Unknown error.", "error", error);
        }
    }, [resetProgress, setCurrent, setTotal, setUnpackagedRows, submitSnackbarMessage, setUnpackagedFiles]);

    const onUpload = useCallback(async (e: ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if(!files) {
            return;
        }
        await parseFiles({
            files: files,
            unpackagedFiles: unpackagedFiles,
            unpackagedRows: unpackagedRows,
        });
    }, [parseFiles]);

    const onDrop = useCallback(async (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();

        const { files } = e.dataTransfer;
        await parseFiles({files, unpackagedFiles, unpackagedRows});
    }, [parseFiles]);

    const handleDragging = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
    }, []);

    return {
        onUpload: onUpload,
        dragOverProps: {
            onDragOver: handleDragging,
            onDragEnter: handleDragging,
            onDragExit: handleDragging,
            onDragLeave: handleDragging,
            onDrop,
        }
    }
}

export default useUnpackageOnUpload;