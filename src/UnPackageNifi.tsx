import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { Button, ButtonGroup, Snackbar } from '@mui/material';
import { ChangeEvent, useState } from 'react';
import unpackageFlowFile from './unpackageFlowFile';
import AttributesTable from './AttributesTable';
import { FlowfileAttributeRowSchema } from './schemas';
import { downloadFile } from './downloadFile';

export function UnPackageNifi() {
    const [openAlert, setOpenAlert] = useState(false);
    const [message, setMessage] = useState("No Message");
    const [rows, setRows] = useState<FlowfileAttributeRowSchema[]>([]);

    document.title = "FlowFile Tools - UnPackage"

    const submitAlert = (message: string) => {
        setMessage(message);
        setOpenAlert(true);
    }

    const handleClose = (_event: React.SyntheticEvent | Event, reason?: string) => {
        if (reason === 'clickaway') {
            return;
        }

        setOpenAlert(false);
    };

    const onUpload = (e: ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files == undefined) {
            submitAlert("No File Provided")
            return;
        } else if (files.length != 1) {
            submitAlert(`Only one file should be provided: ${files.length}`)
            return;
        }

        const file = files[0];
        console.log(file);
        const reader = new FileReader();
        reader.onload = function () {
            const buffer = reader.result;
            if (!(buffer instanceof ArrayBuffer)) {
                return;
            }
            try {
                const result = unpackageFlowFile(buffer);
                if (result == undefined) {
                    return;
                }
                const { attributes, content } = result;
                const newRows: FlowfileAttributeRowSchema[] = [];
                attributes.forEach((value, key) => {
                    newRows.push({ key, value });
                });;
                setRows(newRows);
                const blob = new Blob([content], {
                    type: "application/octet-stream",
                });
                downloadFile(blob, "filename");
            } catch (e) {

            }
        }

        reader.readAsArrayBuffer(file);
    }

    return (
        <>
            <p>Javascript Port of the <a href="https://github.com/apache/nifi/blob/main/nifi-commons/nifi-flowfile-packager/src/main/java/org/apache/nifi/util/FlowFileUnpackagerV3.java">FlowFileUnpackagerV3</a> class.</p>
            <AttributesTable rows={rows} setRows={setRows} submitAlert={submitAlert} />
            <div style={{ marginTop: "10px" }} />
            <ButtonGroup>
                <input
                    style={{ display: 'none' }}
                    id="raised-button-file"
                    type="file"
                    onChange={onUpload}
                />
                <label htmlFor="raised-button-file">
                    <Button component="span" startIcon={<CloudUploadIcon />}>
                        Upload
                    </Button>
                </label>
            </ButtonGroup>
            <Snackbar
                open={openAlert}
                autoHideDuration={6000}
                onClose={handleClose}
                message={message}
            />
        </>
    )
}

export default UnPackageNifi;