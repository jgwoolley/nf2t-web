import { ChangeEvent, useState } from "react";
import AttributesTable from "../../components/AttributesTable";
import { Button, ButtonGroup, TextField, } from "@mui/material";
import { FlowfileAttributeRowSchema, } from "../../utils/schemas";
import AttributeDialog from "../../components/AttributeDialog";
import AttributeDownload from "../../components/AttributeDownload";
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import packageFlowFile from "../../utils/packageFlowFile";
import ClearIcon from '@mui/icons-material/Clear';
import AddIcon from '@mui/icons-material/Add';
import { downloadFile } from "../../utils/downloadFile";
import Spacing from "../../components/Spacing";
import Nf2tHeader from "../../components/Nf2tHeader";
import generateHash from "../../utils/generateHash";
import AttributeUpload from "../../components/AttributeUpload";
import Nf2tSnackbar from "../../components/Nf2tSnackbar";
import { Nf2tSnackbarProps, useNf2tSnackbar } from "../../hooks/useNf2tSnackbar";
import SyncProblemIcon from '@mui/icons-material/SyncProblem';
import { createLazyRoute } from "@tanstack/react-router";

export const Route = createLazyRoute("/package")({
    component: PackageNifi,
})

interface PackageNifiProps extends Nf2tSnackbarProps {
    openAttribute: boolean,
    setOpenAttribute: React.Dispatch<React.SetStateAction<boolean>>,
    file: File | null,
    setFile: React.Dispatch<React.SetStateAction<File | null>>,
    rows: FlowfileAttributeRowSchema[],
    setRows: React.Dispatch<React.SetStateAction<FlowfileAttributeRowSchema[]>>,
    submit: () => void,
    onUpload: (e: ChangeEvent<HTMLInputElement>) => void,
    clear: () => void,
}

function SetFlowFileContent({onUpload, rows, setRows}: PackageNifiProps) {
    return (
        <>
            <h5>1. FlowFile Content</h5>
            {rows.length <= 0 ? (
                <>       
                    <p>Upload a file to package into a FlowFile.</p>
                    <TextField type="file" onChange={onUpload}/>
                </>
            ) : (
                <>
                    <p>Clear existing FlowFile.</p>
                    <Button variant="outlined" onClick={() => setRows([])}>Clear</Button>
                </>
            )}
        </>
    )
}

function SetFlowFileAttributes({rows, setRows, submitSnackbarMessage, openAttribute, setOpenAttribute, clear}: PackageNifiProps) {
    const snackbarProps: Nf2tSnackbarProps = {
        submitSnackbarMessage: submitSnackbarMessage,
    }
    
    return (
        <>
            <h5>2. FlowFile Attributes</h5>
            <p>Edit the FlowFile attributes.</p>
            <AttributesTable rows={rows} setRows={setRows} {...snackbarProps} canEdit={true} />
            <AttributeDialog open={openAttribute} setOpen={setOpenAttribute} setRows={setRows} rows={rows} />
            <Spacing />
            <ButtonGroup>
                <AttributeUpload {...snackbarProps} setRows={setRows} />
                <Button startIcon={<AddIcon />} onClick={() => setOpenAttribute(true)}>Add Attribute</Button>
                <Button startIcon={<ClearIcon />} onClick={() => clear()}>Clear All</Button>
                <AttributeDownload 
                    submitSnackbarMessage={submitSnackbarMessage}
                    rows={rows} 
                />
            </ButtonGroup>
        </>
    )
}

function GetFlowFile({submit, file, submitSnackbarMessage}: PackageNifiProps) {
    return (
        <>
            <h5>3. FlowFile Download</h5>
            <p>Download the Packaged FlowFile.</p>
            {file === null ? (
                <Button variant="outlined" startIcon={<SyncProblemIcon />} onClick={() => submitSnackbarMessage("FlowFile Content was not provided.", "error")}>Download FlowFile</Button>
            ): (
                <Button variant="outlined" startIcon={<CloudDownloadIcon />} onClick={() => submit()}>Download FlowFile</Button>
            )}
        </>
    )
}



async function generateDefaults(file: File, rows: FlowfileAttributeRowSchema[]) {

    if (rows.filter((x) => x[0] === "filename").length == 0) {
        rows.push([
            "filename",
            file.name,
        ]);
    }


    if (file.type.length > 0 && rows.filter((x) => x[0] === "mime.type").length == 0) {
        rows.push([
            "mime.type",
            file.type,
        ])
    }

    if (rows.filter((x) => x[0] === "lastModified").length == 0) {
        rows.push([
            "lastModified",
            file.lastModified.toString(),
        ]);
    }

    if (rows.filter((x) => x[0] === "size").length == 0) {
        rows.push([
            "size",
            file["size"].toString(),
        ]);
    }

    if (rows.filter((x) => x[0] === "SHA-256").length == 0) {
        try {
            const value = await generateHash(file, "SHA-256");
            rows.push([
                "SHA-256",
                value,
            ]);
        } catch(e) {
            console.error(e);
        }
    }  
}

export default function PackageNifi() {
    const [openAttribute, setOpenAttribute] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [rows, setRows] = useState<FlowfileAttributeRowSchema[]>([]);
    const snackbarResults = useNf2tSnackbar();
    const { submitSnackbarMessage } = snackbarResults;

    const submit = () => {
        if (file == undefined) {
            submitSnackbarMessage("No File Provided.", "error")
            return;
        }

        const { blob, filename, } = packageFlowFile(rows, file);
        downloadFile(blob, filename);
    }

    const onUpload = async (e: ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files == undefined) {
            submitSnackbarMessage("No File Provided.", "error")
            return;
        } else if (files.length != 1) {
            submitSnackbarMessage(`Only one file should be provided: ${files.length}.`, "error")
            return;
        }

        const newFile = files[0];
        setFile(newFile);

        const newRows: FlowfileAttributeRowSchema[] = [];
        rows.forEach(x => newRows.push(x));
        setRows([]);

        await generateDefaults(newFile, newRows);
        setRows(newRows);
    }

    const clear = () => {
        setFile(null);
        setRows([]);
        submitSnackbarMessage("Cleared", "error");
    }

    const props: PackageNifiProps = {
        openAttribute: openAttribute,
        setOpenAttribute: setOpenAttribute,
        file: file,
        setFile: setFile,
        rows: rows,
        setRows: setRows,
        submit: submit,
        onUpload: onUpload,
        clear: clear,
        submitSnackbarMessage: submitSnackbarMessage,
    }

    return (
        <>
            <Nf2tHeader to="/package" />
            <SetFlowFileContent {...props}/>
            <SetFlowFileAttributes {...props}/>
            <GetFlowFile {...props} />
            <Nf2tSnackbar {...snackbarResults} />
        </>
    )
}