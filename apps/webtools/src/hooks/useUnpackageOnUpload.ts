import { AlertColor } from "@mui/material";
import { FlowFileResult, unpackageFlowFileStream } from "@nf2t/flowfiletools-js";
import { ChangeEvent, DragEvent, useCallback } from "react";
import untar from "../utils/untar";

// TODO: Move this method back to its component BulkUnpackager

export type UseUnpackageOnUploadParams = {
    resetProgress: () => void,
    submitSnackbarMessage: (message: string, type: AlertColor, data?: unknown) => void,
    setCurrent: (value: React.SetStateAction<number>) => void,
    setTotal: (value: React.SetStateAction<number>) => void,
    unpackagedRows: FlowFileResult[],
    setUnpackagedRows: React.Dispatch<React.SetStateAction<FlowFileResult[]>>,
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

/**
 * 
 * @see https://codesandbox.io/p/sandbox/crazy-butterfly-4c2ehe
 * @see https://github.com/mui/material-ui/issues/33898
 */
export function useUnpackageOnUpload({ resetProgress, submitSnackbarMessage, setCurrent, setTotal, setUnpackagedRows, unpackagedRows }: UseUnpackageOnUploadParams): UseUnpackageOnUploadResults {
    const parseFiles = useCallback(async (files: FileList) => {
        try {
            resetProgress();

            if (files === null || files.length < 1) {
                submitSnackbarMessage(`At least one FlowFile should be provided: ${files?.length}.`, "error")
                return;
            }
            setCurrent(0);
            setTotal(files.length);

            const newRows: FlowFileResult[] = [];
            console.log(`Starting to process ${files.length} file(s).`)

            for (let fileIndex = 0; fileIndex < files.length; fileIndex++) {
                setCurrent(fileIndex);
                setTotal(files.length);
                const file = files[fileIndex];
                const id = crypto?.randomUUID ? crypto.randomUUID() : `${new Date().toISOString()}${fileIndex}`;

                await new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onload = async function () {
                        const buffer = reader.result;
                        if (!(buffer instanceof ArrayBuffer)) {
                            newRows.push({
                                status: "error",
                                parentId: id,
                                error: "Buffer not ArrayBuffer",
                            });
                            resolve(1);
                            return;
                        }

                        const parseFlowFileStream = (arrayBuffer: ArrayBuffer) => {
                            try {
                                const result = unpackageFlowFileStream(arrayBuffer, id);
                                result.forEach(x => {
                                    newRows.push(x);
                                })
                            } catch (error) {
                                newRows.push({
                                    status: "error",
                                    parentId: id,
                                    error: error,
                                });
                                resolve(1);
                                return;
                            }
                        }

                        if (file.name.endsWith(".tar.gz")) {
                            const files = await untar(file);
                            for (const file of files) {
                                parseFlowFileStream(await file.arrayBuffer());
                            }

                        } else {
                            parseFlowFileStream(buffer);
                        }
                        resolve(0);
                    }
                    reader.readAsArrayBuffer(file);
                });
            }

            setCurrent(files.length);
            setTotal(files.length);
            setUnpackagedRows([...unpackagedRows, ...newRows]);
            console.log(`Added ${newRows.length} FlowFile(s).`);
        } catch (error) {
            submitSnackbarMessage("Unknown error.", "error", error);
        }
    }, [resetProgress, setCurrent, setTotal, setUnpackagedRows, submitSnackbarMessage]);

    const onUpload = useCallback(async (e: ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if(!files) {
            return;
        }
        await parseFiles(files);
    }, [parseFiles]);

    const onDrop = useCallback(async (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();

        const { files } = e.dataTransfer;
        await parseFiles(files);
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