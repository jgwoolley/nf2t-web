import { Snackbar, TextField } from '@mui/material';
import { ChangeEvent, useState } from 'react';
import unpackageFlowFile from '../utils/unpackageFlowFile';
import AttributesTable from '../components/AttributesTable';
import { FlowfileAttributeRowSchema } from '../utils/schemas';
import { downloadFile } from '../utils/downloadFile';
import Spacing from '../components/Spacing';
import AttributeDownload from '../components/AttributeDownload';
import NfftHeader, { routeDescriptions } from '../components/NfftHeader';

function findFilename(rows: FlowfileAttributeRowSchema[]) {
    const filteredRows = rows.filter((x) => x.key === "filename");
    if (filteredRows.length == 1) {
        return filteredRows[0].value;
    } else {
        return new Date().toString() + ".bin";
    }
}

function findMimetype(rows: FlowfileAttributeRowSchema[]) {
    const filteredRows = rows.filter((x) => x.key === "mime.type");
    if (filteredRows.length == 1) {
        return filteredRows[0].value;
    } else {
        return "application/octet-stream";
    }
}

export type UnpackageFlowFileProps = {
    rows: FlowfileAttributeRowSchema[],
    setRows: React.Dispatch<React.SetStateAction<FlowfileAttributeRowSchema[]>>,
    submitAlert: (message: string) => void,
    handleClose: (_event: React.SyntheticEvent | Event, reason?: string) => void,
    onUpload: (e: ChangeEvent<HTMLInputElement>) => void,
}

function SetPackagedFlowFile({onUpload}: UnpackageFlowFileProps) {
    return (
        <>
            <h5>1. Packaged Flow File</h5>
            <p>Provide a Packaged Flow File. The unpackaged Flow file content will be immediately downloaded.</p>
            <TextField type="file" onChange={onUpload}/>
        </>
    )
}

function GetFlowFileAttributes({rows, setRows, submitAlert}: UnpackageFlowFileProps) {
    return (
        <>
            <h5>2. Unpackaged Flow File Attributes</h5>
            <p>Download Flow File Attributes.</p>
            <AttributesTable rows={rows} setRows={setRows} submitAlert={submitAlert} canEdit={false} />
            <Spacing />
            <AttributeDownload rows={rows} />
        </>
    )
}

export default function UnpackageFlowFile() {
    const [openAlert, setOpenAlert] = useState(false);
    const [message, setMessage] = useState("No Message");
    const [rows, setRows] = useState<FlowfileAttributeRowSchema[]>([]);

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
                const filename = findFilename(newRows);
                const mimetype = findMimetype(newRows);

                const blob = new Blob([content], {
                    type: mimetype,
                });
                downloadFile(blob, filename);
                submitAlert("downloaded flowfile content");
            } catch (e) {
                console.error(e);
                submitAlert("error unpacking the file");
            }
        }

        reader.readAsArrayBuffer(file);
    }

    const props: UnpackageFlowFileProps = {
        rows: rows,
        setRows: setRows,
        submitAlert: submitAlert,
        handleClose: handleClose,
        onUpload: onUpload,
    }

    return (
        <>
            <NfftHeader {...routeDescriptions.unpackage}/>
            <SetPackagedFlowFile {...props} />            
            <Spacing />
            <GetFlowFileAttributes {...props} />
            <Spacing />
            <Snackbar
                open={openAlert}
                autoHideDuration={6000}
                onClose={handleClose}
                message={message}
            />
        </>
    )
}