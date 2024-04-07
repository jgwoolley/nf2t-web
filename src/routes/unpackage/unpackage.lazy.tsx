import { Button, ButtonGroup, TextField } from '@mui/material';
import { ChangeEvent, useState } from 'react';
import unpackageFlowFile from '../../utils/unpackageFlowFile';
import AttributesTable from '../../components/AttributesTable';
import { FlowfileAttributeRowSchema } from '../../utils/schemas';
import { downloadFile } from '../../utils/downloadFile';
import Spacing from '../../components/Spacing';
import AttributeDownload from '../../components/AttributeDownload';
import Nf2tHeader from '../../components/Nf2tHeader';
import Nf2tSnackbar, { Nf2tSnackbarProps, useNf2tSnackbar } from "../../components/Nf2tSnackbar";
import { Download, SyncProblem } from '@mui/icons-material';
import { createLazyRoute } from '@tanstack/react-router';

export const Route = createLazyRoute("/unpackage")({
    component: UnpackageFlowFile,
})

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

function ContentDownloadButton({ downloadContent, submitSnackbarMessage }: ContentDownloadButtonProps) {
    if (downloadContent == undefined) {
        return (
            <Button startIcon={<SyncProblem />} variant="outlined" onClick={() => submitSnackbarMessage("No content to download.", "error")} >Download Content</Button>
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
            snackbarResults.submitSnackbarMessage("No File Provided.", "error");
            setDownloadContent(undefined);
            return;
        } else if (files.length != 1) {
            snackbarResults.submitSnackbarMessage(`Only one file should be provided: ${files.length}.`, "error")
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
                    snackbarResults.submitSnackbarMessage("downloaded flowfile content.", "info");
                });

            } catch (e) {
                snackbarResults.submitSnackbarMessage("error unpacking the file.", "error", e);
            }
        }

        reader.readAsArrayBuffer(file);
    }

    return (
        <>
            <Nf2tHeader to="/unpackage" />
            <h5>1. Packaged FlowFile</h5>
            {rows.length <= 0 ? (
                <>
                    <p>Provide a Packaged FlowFile. The unpackaged FlowFile content will be available for download.</p>
                    <TextField type="file" onChange={onUpload} />
                </>
            ) : 
            (<>
                <p>Clear the Packaged FlowFile.</p>
                <Button variant="outlined" onClick={() => {
                    //TODO: Not working...
                    setDownloadContent(undefined);
                    setRows([])
                }}>Clear</Button>
            </>)
            }


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
                <ContentDownloadButton {...snackbarResults} downloadContent={downloadContent} />
            </ButtonGroup>
            <Spacing />
            <Nf2tSnackbar {...snackbarResults} />
        </>
    )
}