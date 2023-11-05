import { Snackbar, TextField } from '@mui/material';
import { ChangeEvent, useState } from 'react';
import unpackageFlowFile from './unpackageFlowFile';
import AttributesTable from './AttributesTable';
import { FlowfileAttributeRowSchema } from './schemas';
import { downloadFile } from './downloadFile';
import Spacing from './Spacing';
import AttributeDownload from './AttributeDownload';

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

export function UnPackageNifi() {
    const [openAlert, setOpenAlert] = useState(false);
    const [message, setMessage] = useState("No Message");
    const [rows, setRows] = useState<FlowfileAttributeRowSchema[]>([]);

    document.title = "FlowFile Tools - UnPackage"

    const submitAlert = (message: string) => {
        setMessage(message);
        setOpenAlert(true);
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
                submitAlert("downloaded flowfile content");
            } catch (e) {
                console.error(e);
                submitAlert("error unpacking the file");
            }
        }

        reader.readAsArrayBuffer(file);
    }

    return (
        <>
            <h4>Flow File Unpackager</h4>
            <p>Javascript Port of the <a href="https://github.com/apache/nifi/blob/main/nifi-commons/nifi-flowfile-packager/src/main/java/org/apache/nifi/util/FlowFileUnpackagerV3.java">FlowFileUnpackagerV3</a> class.</p>
            <h5>Packaged Flow File</h5>
            <TextField type="file" onChange={onUpload}/>
            <Spacing />
            <h5>Unpackaged Flow File Attributes</h5>
            <AttributesTable rows={rows} setRows={setRows} submitAlert={submitAlert} canEdit={false} />
            <Spacing />
            <AttributeDownload rows={rows} />
            <Snackbar
                open={openAlert}
                autoHideDuration={6000}
                onClose={handleClose}
                message={message}
            />
        </>
    )
}

export default UnPackageNifi;