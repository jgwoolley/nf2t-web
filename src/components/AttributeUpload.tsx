import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from "@mui/material";
import { FlowfileAttributeRowSchema } from "../utils/schemas";
import FileUploadIcon from '@mui/icons-material/FileUpload';
import { z } from "zod";
import { useState } from "react";
import { Nf2tSnackbarProps } from "./Nf2tSnackbar";

interface AttributeDownloadProps extends Nf2tSnackbarProps {
    setRows: React.Dispatch<React.SetStateAction<FlowfileAttributeRowSchema[]>>,
}

const jsonSchema = z.record(z.string(), z.string());

export function AttributeDownload({setRows, submitSnackbarMessage}: AttributeDownloadProps) {
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
                    newRows.push({
                        key: key, 
                        value: attributes.data[key],
                    })
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
        setRows(newRows);
        submitSnackbarMessage("Uploaded new Attributes.", "info")
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