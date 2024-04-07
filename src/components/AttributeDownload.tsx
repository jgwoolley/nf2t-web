import { Button } from "@mui/material";
import { FlowfileAttributeRowSchema } from "../utils/schemas";
import { downloadFile } from "../utils/downloadFile";
import DownloadIcon from '@mui/icons-material/Download';
import SyncProblemIcon from '@mui/icons-material/SyncProblem';
import { Nf2tSnackbarProps } from "./Nf2tSnackbar";

interface AttributeDownloadProps extends Nf2tSnackbarProps {
    rows: FlowfileAttributeRowSchema[],
}

export function AttributeDownload({rows, submitSnackbarMessage}: AttributeDownloadProps) {
    const onClick = () => {
        const result = new Map<string,string>();
        for(let i = 0; i < rows.length; i++) {
            let row = rows[i];
            result.set(row.key, row.value);
        }
        const blob = new Blob(
            [JSON.stringify(Object.fromEntries(result))], 
            {type: "application/json",}
        );

        downloadFile(blob, "attributes.json");
    }

    if(rows.length <= 0) {
        return (
            <Button startIcon={<SyncProblemIcon />} variant="outlined" onClick={() => submitSnackbarMessage("No attributes to download", "error")} >Download Attributes</Button>
        )
    }

    return (
        <Button startIcon={<DownloadIcon />} variant="outlined" onClick={onClick}>Download Attributes</Button>
    )
}

export default AttributeDownload;