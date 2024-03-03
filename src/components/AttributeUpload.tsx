import { Button, Dialog, DialogContent, DialogTitle, TextField } from "@mui/material";
import { FlowfileAttributeRowSchema } from "../utils/schemas";
import FileUploadIcon from '@mui/icons-material/FileUpload';
import { z } from "zod";
import { useState } from "react";
import { NfftSnackbarProps } from "./NfftSnackbar";

interface AttributeDownloadProps extends NfftSnackbarProps {
    setRows: React.Dispatch<React.SetStateAction<FlowfileAttributeRowSchema[]>>,
}

const jsonSchema = z.record(z.string(), z.string());

export function AttributeDownload({setRows, submitSnackbarMessage, submitSnackbarError}: AttributeDownloadProps) {
    const [open, setOpen] = useState(false);

    const handleClose = () => {
        setOpen(false);
    };
    
    const onChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const newRows: FlowfileAttributeRowSchema[] = [];
        try {
            const files = event.target.files
            if(files === null || files.length !== 1) {
                submitSnackbarError("Must be provided exactly one file!");
                handleClose();
                return;
            }
 
            const file = files[0];
            const text = await file.text();
            const attributes = jsonSchema.safeParse(JSON.parse(text));
            if(attributes.success) {
                for(const key of Object.keys(attributes.data)) {
                    newRows.push({
                        key: key, 
                        value: attributes.data[key],
                    })
                }
            } else {    
                submitSnackbarError("Error processing attributes JSON.", attributes.error);
                handleClose();
                return;
            }

        } catch(e) {
            submitSnackbarError("Error processing attributes JSON.", e);
            handleClose();
            return;
        }
        setRows(newRows);
        submitSnackbarMessage("Uploaded new Attributes.")
        handleClose();
    }

    return (
        <>
            <Button startIcon={<FileUploadIcon />} variant="outlined" onClick={() => setOpen(true)}>Upload Attributes</Button>
            <Dialog onClose={handleClose} open={open}>
                <DialogTitle>Set backup account</DialogTitle>
                <DialogContent>
                    <TextField onChange={onChange} type="file" />
                </DialogContent>
            </Dialog>
        </>
    )
}

export default AttributeDownload;