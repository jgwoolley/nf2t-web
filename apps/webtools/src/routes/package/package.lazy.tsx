import { ChangeEvent, useState } from "react";
import AttributesTable from "../../components/AttributesTable";
import { Button, ButtonGroup, TextField, } from "@mui/material";
import AttributeDialog from "../../components/AttributeDialog";
import AttributeDownload from "../../components/AttributeDownload";
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import ClearIcon from '@mui/icons-material/Clear';
import AddIcon from '@mui/icons-material/Add';
import { downloadFile } from "../../utils/downloadFile";
import Spacing from "../../components/Spacing";
import Nf2tHeader from "../../components/Nf2tHeader";
import AttributeUpload from "../../components/AttributeUpload";
import Nf2tSnackbar from "../../components/Nf2tSnackbar";
import { Nf2tSnackbarProps, useNf2tSnackbar } from "../../hooks/useNf2tSnackbar";
import SyncProblemIcon from '@mui/icons-material/SyncProblem';
import { createLazyRoute } from "@tanstack/react-router";
import { FlowFile, FlowFileResult, packageFlowFileStream, updateNf2tAttributes } from "@nf2t/flowfiletools-js";

export const Route = createLazyRoute("/package")({
    component: PackageNifi,
})

interface PackageNifiProps extends Nf2tSnackbarProps {
    openAttribute: boolean,
    setOpenAttribute: React.Dispatch<React.SetStateAction<boolean>>,
    
    flowFile: FlowFileResult,
    setFlowFile: React.Dispatch<React.SetStateAction<FlowFileResult>>,

    download: () => void,
    onUpload: (e: ChangeEvent<HTMLInputElement>) => void,
    clear: () => void,
}

function SetFlowFileContent({onUpload, setFlowFile}: PackageNifiProps) {
    return (
        <>
            <h5>1. FlowFile Content</h5>
            <p>Upload a file to package into a FlowFile.</p>
            <TextField type="file" onChange={onUpload}/>
            <p>Clear existing FlowFile.</p>
            <Button variant="outlined" onClick={() => setFlowFile({ status: "error", parentId: "none", error: "No Value"})}>Clear</Button>
                
        </>
    )
}

function SetFlowFileAttributes({flowFile, setFlowFile, submitSnackbarMessage, openAttribute, setOpenAttribute, clear}: PackageNifiProps) {
    const snackbarProps: Nf2tSnackbarProps = {
        submitSnackbarMessage: submitSnackbarMessage,
    }
    
    return (
        <>
            <h5>2. FlowFile Attributes</h5>
            <p>Edit the FlowFile attributes.</p>
            <AttributesTable flowFile={flowFile} setFlowFile={setFlowFile} {...snackbarProps} canEdit={true} />
            <AttributeDialog open={openAttribute} setOpen={setOpenAttribute} setFlowFile={setFlowFile} flowFile={flowFile} />
            <Spacing />
            <ButtonGroup>
                <AttributeUpload {...snackbarProps} setFlowFile={setFlowFile} flowFile={flowFile}/>
                <Button startIcon={<AddIcon />} onClick={() => setOpenAttribute(true)}>Add Attribute</Button>
                <Button startIcon={<ClearIcon />} onClick={() => clear()}>Clear All</Button>
                <AttributeDownload 
                    submitSnackbarMessage={submitSnackbarMessage}
                    flowFile={flowFile}
                />
            </ButtonGroup>
        </>
    )
}

function GetFlowFile({download: submit, flowFile, submitSnackbarMessage}: PackageNifiProps) {
    return (
        <>
            <h5>3. FlowFile Download</h5>
            <p>Download the Packaged FlowFile.</p>
            {flowFile === null ? (
                <Button variant="outlined" startIcon={<SyncProblemIcon />} onClick={() => submitSnackbarMessage("FlowFile Content was not provided.", "error")}>Download FlowFile</Button>
            ): (
                <Button variant="outlined" startIcon={<CloudDownloadIcon />} onClick={() => submit()}>Download FlowFile</Button>
            )}
        </>
    )
}

export default function PackageNifi() {
    const [openAttribute, setOpenAttribute] = useState(false);
    const [flowFile, setFlowFile] = useState<FlowFileResult>({ status: "error", parentId: "none", error: "No Value"});
    const snackbarResults = useNf2tSnackbar();
    const { submitSnackbarMessage } = snackbarResults;

    const submit = () => {
        if (flowFile.status !== "success") {
            submitSnackbarMessage("No File Provided.", "error")
            return;
        }

        const result = packageFlowFileStream([flowFile]);
        downloadFile(result);
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
        const newRows: FlowFile[] = [
            {
                status: "success",
                parentId: "none",
                attributes: [],
                content: newFile,
            },
        ]

        updateNf2tAttributes(newRows);
        setFlowFile(newRows[0]);
    }

    const clear = () => {
        setFlowFile({ status: "error", parentId: "none", error: "No Value"});
        submitSnackbarMessage("Cleared", "error");
    }

    const props: PackageNifiProps = {
        openAttribute: openAttribute,
        setOpenAttribute: setOpenAttribute,
        flowFile: flowFile,
        setFlowFile: setFlowFile,
        download: submit,
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