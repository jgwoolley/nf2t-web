import { Button } from "@mui/material";
import { downloadFile } from "../utils/downloadFile";
import DownloadIcon from '@mui/icons-material/Download';
import SyncProblemIcon from '@mui/icons-material/SyncProblem';
import { Nf2tSnackbarProps } from "../hooks/useNf2tSnackbar";
import { findCoreAttributes, FlowFileResult } from "@nf2t/flowfiletools-js";

interface AttributeDownloadProps extends Nf2tSnackbarProps {
    flowFile: FlowFileResult,
}

export function AttributeDownload({flowFile, submitSnackbarMessage}: AttributeDownloadProps) {
    const onClick = () => {
        if(flowFile == undefined) {
            // TODO: Check
            return;
        }
        if(flowFile.status !== "success") {
            // TODO: Check
            return;
        }

        const coreAttributes = findCoreAttributes(flowFile.attributes);
        const blob = new File([JSON.stringify(coreAttributes)], "attributes.json", {type: "application/json",});
        downloadFile(blob);
    }

    if(flowFile == null || flowFile.status !== "success" || flowFile.attributes.length <= 0) {
        return (
            <Button startIcon={<SyncProblemIcon />} variant="outlined" onClick={() => submitSnackbarMessage("No attributes to download", "error")} >Download Attributes</Button>
        )
    }

    return (
        <Button startIcon={<DownloadIcon />} variant="outlined" onClick={onClick}>Download Attributes</Button>
    )
}

export default AttributeDownload;