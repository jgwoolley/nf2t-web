import { AlertColor } from "@mui/material";
import { FlowFileResult, unpackageFlowFileStream } from "@nf2t/flowfiletools-js";
import { ChangeEvent, useCallback } from "react";

// TODO: Move this method back to its component BulkUnpackager

export type UseUnpackageOnUploadParams = {
    resetProgress: () => void,
    submitSnackbarMessage: (message: string, type: AlertColor, data?: unknown) => void,
    setCurrent: (value: React.SetStateAction<number>) => void,
    setTotal: (value: React.SetStateAction<number>) => void,
    setUnpackagedRows: React.Dispatch<React.SetStateAction<FlowFileResult[]>>,
}

export function useUnpackageOnUpload({resetProgress, submitSnackbarMessage, setCurrent, setTotal, setUnpackagedRows}: UseUnpackageOnUploadParams)  {
    return useCallback(async (e: ChangeEvent<HTMLInputElement>) => {
        try {
            resetProgress();
            const files = e.target.files;
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
                await new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onload = function () {
                        const buffer = reader.result;
                        if (!(buffer instanceof ArrayBuffer)) {
                            console.error("Buffer not ArrayBuffer");
                            resolve(1);
                            return;
                        }
                        try {
                            const result = unpackageFlowFileStream(buffer);
                            result.forEach(x => {
                                if(x.status === "success") {
                                    newRows.push(x);
                                }
                            })
                        } catch (e) {
                            console.error(e);
                            resolve(3);
                            return;
                        }
                        resolve(0);
                    }
                    reader.readAsArrayBuffer(file);
                });
            }

            setCurrent(files.length);
            setTotal(files.length);
            setUnpackagedRows([...newRows]);
            console.log(`Added ${newRows.length} FlowFile(s).`);
        } catch (error) {
            submitSnackbarMessage("Unknown error.", "error", error);
        }
    }, [resetProgress, setCurrent, setTotal, setUnpackagedRows, submitSnackbarMessage]);
}

export default useUnpackageOnUpload;