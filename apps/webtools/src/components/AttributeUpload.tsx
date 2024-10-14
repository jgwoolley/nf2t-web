import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from "@mui/material";
import { FlowFileAttribute as FlowfileAttributeRowSchema } from '@nf2t/flowfiletools-js';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import { z } from "zod";
import { useState } from "react";
import { Nf2tSnackbarProps } from "../hooks/useNf2tSnackbar";
import { FlowFileResult } from "@nf2t/flowfiletools-js";

interface AttributeDownloadProps extends Nf2tSnackbarProps {
    flowFile: FlowFileResult,
    setFlowFile: React.Dispatch<React.SetStateAction<FlowFileResult>>,
}

const jsonSchema = z.record(z.string(), z.string());

export function AttributeDownload({flowFile, setFlowFile, submitSnackbarMessage}: AttributeDownloadProps) {
    const [open, setOpen] = useState(false);

    const handleClose = () => {
        setOpen(false);
    };
    
    const onChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const newRows: FlowfileAttributeRowSchema[] = [];
        try {
            const files = event.target.files
            if(files === null || files.length !== 1) {
                submitSnackbarMessage("Must be provided exactly one file.", "error");
                handleClose();
                return;
            }
 
            const file = files[0];
            const text = await file.text();
            const attributes = jsonSchema.safeParse(JSON.parse(text));
            if(attributes.success) {
                for(const key of Object.keys(attributes.data)) {
                    newRows.push([
                        key,
                        attributes.data[key],
                    ])
                }
            } else {    
                submitSnackbarMessage("Error processing attributes JSON.", "error", attributes.error);
                handleClose();
                return;
            }

        } catch(e) {
            submitSnackbarMessage("Error processing attributes JSON.", "error", e);
            handleClose();
            return;
        }

        if(flowFile.status === "success") {
            setFlowFile({
                status: "success",
                parentId: flowFile.parentId,
                content: flowFile.content,
                attributes: newRows
            });
            submitSnackbarMessage("Uploaded new Attributes.", "info")
        } else {
            submitSnackbarMessage("Unable to uploaded new Attributes.", "error")
        }

        handleClose();
    }

    return (
        <>
            <Button startIcon={<FileUploadIcon />} variant="outlined" onClick={() => setOpen(true)}>Upload Attributes</Button>
            <Dialog onClose={handleClose} open={open}>
                <DialogTitle>Upload Attribute JSON</DialogTitle>
                <DialogContent>
                    <TextField onChange={onChange} type="file" />
                </DialogContent>
                <DialogActions>
                <Button onClick={handleClose} autoFocus>Close</Button>
                </DialogActions>
            </Dialog>
        </>
    )
}

export default AttributeDownload;