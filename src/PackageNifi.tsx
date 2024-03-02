import { ChangeEvent, useState } from "react"
import AttributesTable from "./AttributesTable"
import { Button, ButtonGroup, Snackbar, TextField, } from "@mui/material";
import { FlowfileAttributeRowSchema, } from "./schemas";
import AttributeDialog from "./AttributeDialog";
import AttributeDownload from "./AttributeDownload";
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import packageFlowFile from "./packageFlowFile";
import ClearIcon from '@mui/icons-material/Clear';
import AddIcon from '@mui/icons-material/Add';
import { downloadFile } from "./downloadFile";
import Spacing from "./Spacing";
import references from "./references";
import ExternalLink from "./ExternalLink";

function PackageNifi() {
    const [openAttribute, setOpenAttribute] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [openAlert, setOpenAlert] = useState(false);
    const [message, setMessage] = useState("No Message");
    const [rows, setRows] = useState<FlowfileAttributeRowSchema[]>([]);

    document.title = "FlowFile Tools - Package"

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

    return (
        <>
            <h4>Flow File Packager</h4>
            <p>Javascript Port of the <ExternalLink href={references.FlowFilePackagerV3}>FlowFilePackagerV3</ExternalLink> class.</p>
            <h5>Flow File Attributes</h5>
            <AttributesTable rows={rows} setRows={setRows} submitAlert={submitAlert} canEdit={true} />
            <AttributeDialog open={openAttribute} setOpen={setOpenAttribute} setRows={setRows} rows={rows} />
            <Spacing />
            <ButtonGroup>
                <Button startIcon={<AddIcon />} onClick={() => setOpenAttribute(true)}>Add Attribute</Button>
                <Button startIcon={<ClearIcon />} onClick={() => clear()}>Clear All</Button>
                <AttributeDownload rows={rows} />
            </ButtonGroup>
            <h5>Flow File Content</h5>
            <TextField type="file" onChange={onUpload}/>
            <h5>Flow File Download</h5>
            <Button variant="outlined" startIcon={<CloudDownloadIcon />} onClick={() => submit()}>Download Flow File</Button>
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