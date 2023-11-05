import { Button } from "@mui/material";
import { FlowfileAttributeRowSchema } from "./schemas";
import { downloadFile } from "./downloadFile";
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';

interface AttributeDownloadProps {
    rows: FlowfileAttributeRowSchema[],
}

export function AttributeDownload(props: AttributeDownloadProps) {
    const onClick = () => {
        const result = new Map<string,string>();
        for(let i = 0; i < props.rows.length; i++) {
            let row = props.rows[i];
            result.set(row.key, row.value);
        }
        const blob = new Blob(
            [JSON.stringify(Object.fromEntries(result))], 
            {type: "application/json",}
        );

        downloadFile(blob, "attributes.json");
    }

    return (
        <Button startIcon={<CloudDownloadIcon />} variant="outlined" onClick={onClick}>Download Attributes</Button>
    )
}

export default AttributeDownload;