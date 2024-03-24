import { TextField } from '@mui/material';
import { ChangeEvent, useState } from 'react';
import unpackageFlowFile from '../utils/unpackageFlowFile';
import AttributesTable from '../components/AttributesTable';
import { FlowfileAttributeRowSchema } from '../utils/schemas';
import { downloadFile } from '../utils/downloadFile';
import Spacing from '../components/Spacing';
import AttributeDownload from '../components/AttributeDownload';
import Nf2tHeader, { routeDescriptions } from '../components/Nf2tHeader';
import Nf2tSnackbar, { Nf2tSnackbarProps, useNf2tSnackbar } from "../components/Nf2tSnackbar";

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

export interface UnpackageFlowFileProps extends Nf2tSnackbarProps {
    rows: FlowfileAttributeRowSchema[],
    setRows: React.Dispatch<React.SetStateAction<FlowfileAttributeRowSchema[]>>,
    onUpload: (e: ChangeEvent<HTMLInputElement>) => void,
}

function SetPackagedFlowFile({onUpload}: UnpackageFlowFileProps) {
    return (
        <>
            <h5>1. Packaged FlowFile</h5>
            <p>Provide a Packaged FlowFile. The unpackaged FlowFile content will be immediately downloaded.</p>
            <TextField type="file" onChange={onUpload}/>
        </>
    )
}

function GetFlowFileAttributes({rows, setRows, submitSnackbarMessage, submitSnackbarError}: UnpackageFlowFileProps) {
    return (
        <>
            <h5>2. Unpackaged FlowFile Attributes</h5>
            <p>Download FlowFile Attributes.</p>
            <AttributesTable 
                rows={rows} 
                setRows={setRows} 
                submitSnackbarMessage={submitSnackbarMessage} 
                submitSnackbarError={submitSnackbarError}
                canEdit={false} 
            />
            <Spacing />
            <AttributeDownload 
                submitSnackbarMessage={submitSnackbarMessage}
                submitSnackbarError={submitSnackbarError}
                rows={rows} 
            />
        </>
    )
}

export default function UnpackageFlowFile() {
    const snackbarResults = useNf2tSnackbar();
    const {submitSnackbarMessage, submitSnackbarError } = snackbarResults;

    const [rows, setRows] = useState<FlowfileAttributeRowSchema[]>([]);

    const onUpload = (e: ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files == undefined) {
            submitSnackbarError("No File Provided")
            return;
        } else if (files.length != 1) {
            submitSnackbarError(`Only one file should be provided: ${files.length}`)
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
                submitSnackbarMessage("downloaded flowfile content");
            } catch (e) {
                console.error(e);
                submitSnackbarError("error unpacking the file");
            }
        }

        reader.readAsArrayBuffer(file);
    }

    const props: UnpackageFlowFileProps = {
        rows: rows,
        setRows: setRows,
        submitSnackbarMessage: submitSnackbarMessage,
        submitSnackbarError: submitSnackbarError,
        onUpload: onUpload,
    }

    return (
        <>
            <Nf2tHeader {...routeDescriptions.unpackage}/>
            <SetPackagedFlowFile {...props} />            
            <Spacing />
            <GetFlowFileAttributes {...props} />
            <Spacing />
            <Nf2tSnackbar {...snackbarResults} />
        </>
    )
}