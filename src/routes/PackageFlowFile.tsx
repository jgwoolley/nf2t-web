import { ChangeEvent, useState } from "react"
import AttributesTable from "../components/AttributesTable"
import { Button, ButtonGroup, Snackbar, TextField, } from "@mui/material";
import { FlowfileAttributeRowSchema, } from "../utils/schemas";
import AttributeDialog from "../components/AttributeDialog";
import AttributeDownload from "../components/AttributeDownload";
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import packageFlowFile from "../utils/packageFlowFile";
import ClearIcon from '@mui/icons-material/Clear';
import AddIcon from '@mui/icons-material/Add';
import { downloadFile } from "../utils/downloadFile";
import Spacing from "../components/Spacing";
import NfftHeader, { routeDescriptions } from "../components/NfftHeader";

type PackageNifiProps = {
    openAttribute: boolean,
    setOpenAttribute: React.Dispatch<React.SetStateAction<boolean>>,
    file: File | null,
    setFile: React.Dispatch<React.SetStateAction<File | null>>,
    rows: FlowfileAttributeRowSchema[],
    setRows: React.Dispatch<React.SetStateAction<FlowfileAttributeRowSchema[]>>,
    submitAlert: (message: string) => void,
    submit: () => void,
    onUpload: (e: ChangeEvent<HTMLInputElement>) => void,
    clear: () => void,
}

function SetFlowFileContent({onUpload}: PackageNifiProps) {
    return (
        <>
            <h5>1. Flow File Content</h5>
            <p>Upload a file to package into a Flow File.</p>
            <TextField type="file" onChange={onUpload}/>
        </>
    )
}

function SetFlowFileAttributes({rows, setRows, submitAlert, openAttribute, setOpenAttribute, clear}: PackageNifiProps) {
    return (
        <>
            <h5>2. Flow File Attributes</h5>
            <p>Edit the Flow File attributes.</p>
            <AttributesTable rows={rows} setRows={setRows} submitAlert={submitAlert} canEdit={true} />
            <AttributeDialog open={openAttribute} setOpen={setOpenAttribute} setRows={setRows} rows={rows} />
            <Spacing />
            <ButtonGroup>
                <Button startIcon={<AddIcon />} onClick={() => setOpenAttribute(true)}>Add Attribute</Button>
                <Button startIcon={<ClearIcon />} onClick={() => clear()}>Clear All</Button>
                <AttributeDownload rows={rows} />
            </ButtonGroup>
        </>
    )
}

function GetFlowFile({submit}: PackageNifiProps) {
    return (
        <>
            <h5>3. Flow File Download</h5>
            <p>Download the Packaged Flow File.</p>
            <Button variant="outlined" startIcon={<CloudDownloadIcon />} onClick={() => submit()}>Download Flow File</Button>
        </>
    )
}

function PackageNifi() {
    const [openAttribute, setOpenAttribute] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [openAlert, setOpenAlert] = useState(false);
    const [message, setMessage] = useState("No Message");
    const [rows, setRows] = useState<FlowfileAttributeRowSchema[]>([]);

    const submitAlert = (message: string) => {
        setMessage(message);
        setOpenAlert(true);
    }

    const submit = () => {
        if (file == undefined) {
            submitAlert("No File Provided")
            return;
        }

        const { blob, filename, } = packageFlowFile(rows, file);
        downloadFile(blob, filename);
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

        const newFile = files[0];

        setFile(newFile);

        if (rows.filter((x) => x.key === "filename").length == 0) {
            rows.push({
                key: "filename",
                value: newFile.name,
            })
        }


        if (rows.filter((x) => x.key === "mime.type").length == 0) {
            rows.push({
                key: "mime.type",
                value: newFile.type,
            })
        }

        if (rows.filter((x) => x.key === "lastModified").length == 0) {
            rows.push({
                key: "lastModified",
                value: newFile.lastModified.toString(),
            })
        }

        if (rows.filter((x) => x.key === "size").length == 0) {
            rows.push({
                key: "size",
                value: newFile["size"].toString(),
            })
        }
    }

    const clear = () => {
        setFile(null);
        setRows([]);
        submitAlert("Cleared");
    }

    const props: PackageNifiProps = {
        openAttribute: openAttribute,
        setOpenAttribute: setOpenAttribute,
        file: file,
        setFile: setFile,
        rows: rows,
        setRows: setRows,
        submitAlert: submitAlert,
        submit: submit,
        onUpload: onUpload,
        clear: clear,
    }

    return (
        <>
            <NfftHeader {...routeDescriptions.package} />
            <SetFlowFileContent {...props}/>
            <SetFlowFileAttributes {...props}/>
            <GetFlowFile {...props} />

            <Snackbar
                open={openAlert}
                autoHideDuration={6000}
                onClose={handleClose}
                message={message}
            />
        </>
    )
}

export default PackageNifi;