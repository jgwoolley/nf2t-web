import { Button, ButtonGroup, TextField } from '@mui/material';
import { ChangeEvent, useMemo, useState } from 'react';
import unpackageFlowFile from '../../utils/unpackageFlowFile';
import AttributesTable from '../../components/AttributesTable';
import { FlowfileAttributeRowSchema } from '../../utils/schemas';
import { downloadFile } from '../../utils/downloadFile';
import Spacing from '../../components/Spacing';
import AttributeDownload from '../../components/AttributeDownload';
import Nf2tHeader from '../../components/Nf2tHeader';
import Nf2tSnackbar from "../../components/Nf2tSnackbar";
import { Nf2tSnackbarProps, useNf2tSnackbar } from "../../hooks/useNf2tSnackbar";

import { Download, SyncProblem } from '@mui/icons-material';
import { Link, createLazyRoute } from '@tanstack/react-router';
import Nf2tTable from '../../components/Nf2tTable';
import { useNf2tTable } from '../../hooks/useNf2tTable';
import { useNf2tContext } from '../../hooks/useNf2tContext';
import { findFilename, findMimetype } from '../../hooks/useUnpackage';

export const Route = createLazyRoute("/unpackage")({
    component: UnpackageFlowFile,
})

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
    const { queryResults } = useNf2tContext();

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
                const { content } = result;
                const attributes = Object.entries(result.attributes);

                setRows(attributes);

                setDownloadContent(() => () => {
                    const filename = findFilename(attributes);
                    const mimetype = findMimetype(attributes);

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

    const evaluatedProcessors = useMemo(() => {
        if(!queryResults.data) {
            return [];
        }

        const flowFileAttributes = new Set<string>();
        for(const row of rows) {
            flowFileAttributes.add(row[0]);
        }

        const results = new Map<string, [number, number]>();

        for(const attribute of queryResults.data.attributes) {
            let result = results.get(attribute.extensionId);
            if(result == undefined) {
                result = [0, 0];
                results.set(attribute.extensionId, result);
            }

            result[0] +=1;

            if(attribute.type === "writes") {
                for(const localAttribute of flowFileAttributes) {
                    if(attribute.name === localAttribute) {
                        result[1] +=1;
                    }
                }
            }
        }

        return Array.from(results.entries()).filter( x => x[1][1] > 0).map( x => {
            return {
                extensionId: x[0],
                total: x[1][0],
                sameCount: x[1][1],
                matchPercent: (x[1][1]) / (x[1][0]),
            }
        });
    }, [rows, queryResults.data]);

    const tableProps = useNf2tTable({
        childProps: undefined,
        snackbarProps: snackbarResults,
        rows: evaluatedProcessors,
        columns: [
            {
                columnName: 'ExtensionId',
                bodyRow:({row}) => <Link to="/extensionLookup" search={{name: row.extensionId}}>{row.extensionId}</Link>,
                rowToString: (row) => row.extensionId,
            },
            {
                columnName: 'Count',
                bodyRow:({row}) => <>{Math.round(row.matchPercent * 100)}% ({row.sameCount}/{row.total})</>,
                rowToString: (row) => row.matchPercent.toString(),
                compareFn: (a, b) => a.matchPercent - b.matchPercent,
            },
    ],
        canEditColumn: false,
    });

    return (
        <>
            <Nf2tHeader to="/unpackage" />
            <h5>1. Packaged FlowFile</h5>
            {Object.entries(rows).length <= 0 ? (
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
                    setRows([]);
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

            <h5>Possible Processors</h5>
            <p>These are processors which might have updated this FlowFile.</p>
            <Nf2tTable {...tableProps} />

            <Spacing />
            <Nf2tSnackbar {...snackbarResults} />
        </>
    )
}