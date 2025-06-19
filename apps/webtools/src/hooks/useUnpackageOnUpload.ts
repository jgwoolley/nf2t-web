import { AlertColor } from "@mui/material";
import { FlowFileResults, unpackageFlowFileStream } from "@nf2t/flowfiletools-js";
import { ChangeEvent, DragEvent, useCallback } from "react";
import untar from "../utils/untar";
import { UnpackagedFile } from "../utils/schemas";

// TODO: Move this method back to its component BulkUnpackager

export type UseUnpackageOnUploadParams = {
    resetProgress: () => void,
    submitSnackbarMessage: (message: string, type: AlertColor, data?: unknown) => void,
    setCurrent: (value: React.SetStateAction<number | undefined>) => void,
    setTotal: (value: React.SetStateAction<number | undefined>) => void,
    flowFileResults: FlowFileResults,
    setFlowFileResults: React.Dispatch<React.SetStateAction<FlowFileResults>>,
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
    unpackagedRows: FlowFileResults,
    files: FileList,
}

/**
 * 
 * @see https://codesandbox.io/p/sandbox/crazy-butterfly-4c2ehe
 * @see https://github.com/mui/material-ui/issues/33898
 */
export function useUnpackageOnUpload({ resetProgress, submitSnackbarMessage, setCurrent, setTotal, setFlowFileResults, flowFileResults: unpackagedRows, unpackagedFiles, setUnpackagedFiles}: UseUnpackageOnUploadParams): UseUnpackageOnUploadResults {
    const parseFiles = useCallback(async ({files, unpackagedFiles, unpackagedRows}: ParseFilesParameters) => {
        try {
            resetProgress();

            if (files === null || files.length < 1) {
                submitSnackbarMessage(`At least one FlowFile should be provided: ${files?.length}.`, "error")
                return;
            }
            setCurrent(0);
            setTotal(files.length);

            const newRows: FlowFileResults = { errors: [], success: [], };
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
                        result.success.forEach(x => {
                            newRows.success.push(x);
                        })
                    } catch (error) {
                        newRows.errors.push({
                            parentId: id,
                            error: error,
                        });
                    }

                    setFlowFileResults({...newRows});
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
            setFlowFileResults({
                success: [ ...unpackagedRows.success, ...newRows.success],
                errors: [ ...unpackagedRows.errors, ...newRows.errors],
            });
            setUnpackagedFiles([...unpackagedFiles, ...newUnpackagedFiles]);
            submitSnackbarMessage(`Unpackaged ${newUnpackagedFiles.length} file(s) into ${newRows.success.length} FlowFile(s).`, "success", {
                "files.length": files.length,
                "newRows.length": newRows.success.length + newRows.errors.length,
                "unpackagedRows.length": unpackagedRows.success.length + unpackagedRows.errors.length,
                "newUnpackagedFiles.length": newUnpackagedFiles.length,
                "unpackagedFiles.length": unpackagedFiles.length,
            });
        } catch (error) {
            submitSnackbarMessage("Unknown error.", "error", error);
        }
    }, [resetProgress, setCurrent, setTotal, setFlowFileResults, submitSnackbarMessage, setUnpackagedFiles]);

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