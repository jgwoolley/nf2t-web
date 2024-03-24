import { Button, ButtonGroup, TextField } from '@mui/material';
import { ChangeEvent, useState } from 'react';
import unpackageFlowFile from '../utils/unpackageFlowFile';
import AttributesTable from '../components/AttributesTable';
import { FlowfileAttributeRowSchema } from '../utils/schemas';
import { downloadFile } from '../utils/downloadFile';
import Spacing from '../components/Spacing';
import AttributeDownload from '../components/AttributeDownload';
import Nf2tHeader, { routeDescriptions } from '../components/Nf2tHeader';
import Nf2tSnackbar, { Nf2tSnackbarProps, useNf2tSnackbar } from "../components/Nf2tSnackbar";
import { Download, SyncProblem } from '@mui/icons-material';

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

type DownloadContentType = (() => void);

interface ContentDownloadButtonProps extends Nf2tSnackbarProps {
    downloadContent?: DownloadContentType,
}

function ContentDownloadButton({downloadContent, submitSnackbarError}: ContentDownloadButtonProps) {
    if(downloadContent == undefined) {
        return (
            <Button startIcon={<SyncProblem />} variant="outlined" onClick={() => submitSnackbarError("No content to download")} >Download Content</Button>
        )
    }

    return (
        <Button startIcon={<Download />} variant="outlined" onClick={downloadContent}>Download Content</Button>
    )
}

export default function UnpackageFlowFile() {
    const snackbarResults = useNf2tSnackbar();
    const [rows, setRows] = useState<FlowfileAttributeRowSchema[]>([]);
    const [downloadContent, setDownloadContent] = useState<DownloadContentType>();

    const onUpload = (e: ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files == undefined) {
            snackbarResults.submitSnackbarError("No File Provided");
            setDownloadContent(undefined);
            return;
        } else if (files.length != 1) {
            snackbarResults.submitSnackbarError(`Only one file should be provided: ${files.length}`)
            setDownloadContent(undefined);
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
                    setDownloadContent(undefined);
                    return;
                }
                const { attributes, content } = result;
                const newRows: FlowfileAttributeRowSchema[] = [];
                attributes.forEach((value, key) => {
                    newRows.push({ key, value });
                });;
                setRows(newRows);

                setDownloadContent(() => () => {
                    const filename = findFilename(newRows);
                    const mimetype = findMimetype(newRows);
    
                    const blob = new Blob([content], {
                        type: mimetype,
                    });
                    downloadFile(blob, filename);
                    snackbarResults.submitSnackbarMessage("downloaded flowfile content");
                });

            } catch (e) {
                snackbarResults.submitSnackbarError("error unpacking the file", e);
            }
        }

        reader.readAsArrayBuffer(file);
    }

    return (
        <>
            <Nf2tHeader {...routeDescriptions.unpackage}/>
            <h5>1. Packaged FlowFile</h5>
            <p>Provide a Packaged FlowFile. The unpackaged FlowFile content will be immediately downloaded.</p>
            <TextField type="file" onChange={onUpload}/>          
            <Spacing />
            <h5>2. Unpackaged FlowFile Attributes</h5>
            <p>Download FlowFile Attributes.</p>
            <AttributesTable 
                {...snackbarResults}
                rows={rows} 
                setRows={setRows} 
                canEdit={false} 
            />
            <Spacing />
            <ButtonGroup>
                <AttributeDownload 
                    {...snackbarResults}
                    rows={rows} 
                />
                <ContentDownloadButton {...snackbarResults} downloadContent={downloadContent}/>
            </ButtonGroup>
            <Spacing />
            <Nf2tSnackbar {...snackbarResults} />
        </>
    )
}