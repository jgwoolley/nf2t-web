import { Box, Button, LinearProgress, TextField, Tooltip, Typography } from '@mui/material';
import { ChangeEvent, useMemo, useState } from 'react';
import unpackageFlowFile from '../../utils/unpackageFlowFile';
import Spacing from '../../components/Spacing';
import { downloadFile } from '../../utils/downloadFile';
import Nf2tHeader from '../../components/Nf2tHeader';
import Nf2tSnackbar, { Nf2tSnackbarProps, useNf2tSnackbar } from "../../components/Nf2tSnackbar";
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import SyncProblemIcon from "@mui/icons-material/SyncProblem";
import { createLazyRoute } from '@tanstack/react-router';
import Nf2tTable, { Nf2tTableColumnSpec, useNf2tTable } from '../../components/Nf2tTable';

export const Route = createLazyRoute("/unpackageBulk")({
    component: UnPackageNifi,
})

const defaultTotal = -1;
const defaultCurrent = 0;

// From: https://mui.com/material-ui/react-progress/
function LinearProgressWithLabel({ current, total }: { current: number, total: number }) {
    const value = useMemo(() => ((current) / total) * 100, [current, total])

    return (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ width: '100%', mr: 1 }}>
                <LinearProgress variant="determinate" value={value} />
            </Box>
            <Box sx={{ minWidth: 35 }}>
                <Tooltip title={`${current}/${total}`}>
                    <Typography variant="body2" color="text.secondary">{`${Math.round(
                        value,
                    )}%`}</Typography>
                </Tooltip>
            </Box>
        </Box>
    );
}

export interface BulkUnpackageDownloadButtonProps extends Nf2tSnackbarProps {
    rows: Map<string, string>[],
    attributes: string[] | undefined,
}

export function BulkUnpackageDownloadButton({ submitSnackbarMessage, rows, attributes }: BulkUnpackageDownloadButtonProps) {
    const onClick = () => {
        if (attributes == undefined) {
            submitSnackbarMessage("No attributes provided.", "error");
            return;
        }

        let content = attributes.map(x => JSON.stringify(x)).join(",");
        content += "\n";

        for (const row of rows) {
            for (const key of attributes) {
                content += JSON.stringify(row.get(key) || "")
                content += ","
            }
            content += "\n"
        }

        const blob = new Blob([content], {
            type: "text/csv",
        })

        downloadFile(blob, "bulk.csv");
        submitSnackbarMessage("Downloaded bulk report.", "info");
    }

    if (rows.length <= 0 || attributes == undefined || attributes.length <= 0) {
        return (
            <Button startIcon={<SyncProblemIcon />} variant="outlined" onClick={() => submitSnackbarMessage("No attributes to download", "error")} >Download Report</Button>
        )
    }

    return (
        <Button startIcon={<CloudDownloadIcon />} variant="outlined" onClick={onClick}>Download Report</Button>
    )
}

export function UnPackageNifi() {
    const snackbarResults = useNf2tSnackbar();
    const { submitSnackbarMessage } = snackbarResults;
    const [total, setTotal] = useState(defaultTotal);
    const [current, setCurrent] = useState(defaultCurrent);
    const [attributes, setAttributes] = useState<string[]>();
    const [rows, setRows] = useState<Map<string, string>[]>([]);

    const resetProgress = () => {
        tableProps.restoreDefaultFilteredColumns();
        setTotal(defaultTotal);
        setCurrent(defaultCurrent);
    }

    const columns: Nf2tTableColumnSpec<Map<string, string>, undefined>[] = useMemo(() => {
        const results: Nf2tTableColumnSpec<Map<string, string>, undefined>[] = [];
        if(attributes == undefined) {
            return results;
        }

        for(const attribute of attributes) {
            results.push({
                columnName: attribute,
                bodyRow: ({row}) => row.get(attribute) || "",
                rowToString: (row: Map<string, string>) => row.get(attribute) || "",
            });
        }

        return results;
    }, [attributes]);

    const tableProps = useNf2tTable<Map<string, string>, undefined>({
        childProps: undefined,
        snackbarProps: snackbarResults,
        canEditColumn: true,
        columns: columns,
        rows: rows,
        ignoreNoColumnsError: true,
    });

    const onUpload = async (e: ChangeEvent<HTMLInputElement>) => {
        try {
            resetProgress();
            const files = e.target.files;
            if (files === null || files.length < 1) {
                submitSnackbarMessage(`At least one FlowFile should be provided: ${files?.length}.`, "error")
                return;
            }
            setCurrent(0);
            setTotal(files.length);

            const uniqueAttributes = new Set<string>();
            const rows: Map<string, string>[] = [];
            console.log(`Starting to process ${files.length} file(s).`)

            for (let fileIndex = 0; fileIndex < files.length; fileIndex++) {
                setCurrent(fileIndex);
                setTotal(files.length);
                const file = files[fileIndex];
                await new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onload = function () {
                        const buffer = reader.result;
                        if (!(buffer instanceof ArrayBuffer)) {
                            console.error("Buffer not ArrayBuffer");
                            resolve(1);
                            return;
                        }
                        try {
                            const result = unpackageFlowFile(buffer);
                            if (result == undefined) {
                                console.error("Recieved no result from unpackageFlowFile.");
                                resolve(2);
                                return;
                            }
                            result.attributes.forEach((_value, key) => uniqueAttributes.add(key));
                            rows.push(result.attributes);
                        } catch (e) {
                            console.error(e);
                            resolve(3);
                            return;
                        }
                        resolve(0);
                    }
                    reader.readAsArrayBuffer(file);
                });
            }

            setCurrent(files.length);
            setTotal(files.length);

            if (uniqueAttributes.size <= 0) {
                submitSnackbarMessage("Did not find any attributes in the given files.",
                    "error",
                    {
                        uniqueAttributes: uniqueAttributes.size,
                        files: files.length,
                    });
                return;
            }

            const attributes = Array.from(uniqueAttributes);
            setAttributes(attributes);

            if (attributes.length <= 0) {
                submitSnackbarMessage("Did not find any attributes in the given files.",
                    "error",
                    {
                        uniqueAttributes: uniqueAttributes.size,
                        attributes: attributes.length,
                        files: files.length,
                    });
                return;
            }
            setRows([...rows]);
            tableProps.restoreDefaultFilteredColumns();
        } catch (error) {
            submitSnackbarMessage("Unknown error.", "error", error);
        }
    }

    const clearFlowFiles = () => {
        setRows([]);
        setAttributes([]);
        tableProps.restoreDefaultFilteredColumns();
    }

    return (
        <>
            <Nf2tHeader to="/unpackageBulk" />
            <h5>1. Packaged FlowFiles</h5>
            {rows.length <= 0 ? (<>
                <p>Provide multiple FlowFiles.</p>
                <TextField inputProps={{ multiple: true }} type="file" onChange={onUpload} />
            </>) : (<>
                <p>Clear provided FlowFiles.</p>
                <Button variant="outlined" onClick={clearFlowFiles}>Clear</Button>
            </>)}

            <Spacing />
            <h5>2. Download FlowFile Attributes CSV</h5>
            <p>A CSV will be downloadable with all of the FlowFile attributes for each FlowFile provided. This may take some time.</p>
            <LinearProgressWithLabel current={current} total={total} />
            <Spacing />
            {attributes && (
                <>
                    <Nf2tTable {...tableProps} />
                    <Spacing />
                </>
            )}
            <BulkUnpackageDownloadButton {...snackbarResults} rows={rows} attributes={attributes} />
            <Spacing />
            <Nf2tSnackbar {...snackbarResults} />
        </>
    )
}

export default UnPackageNifi;