import { Box, Button, ButtonGroup, IconButton, LinearProgress, Tooltip, Typography } from '@mui/material';
import { useCallback, useMemo, useState } from 'react';
import Spacing from '../../components/Spacing';
import { downloadFile } from '../../utils/downloadFile';
import Nf2tHeader from '../../components/Nf2tHeader';
import Nf2tSnackbar from "../../components/Nf2tSnackbar";
import { Nf2tSnackbarProps, useNf2tSnackbar } from "../../hooks/useNf2tSnackbar";
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import SyncProblemIcon from "@mui/icons-material/SyncProblem";
import { createLazyRoute, Link } from '@tanstack/react-router';
import Nf2tTable from '../../components/Nf2tTable';
import { Nf2tTableColumnSpec, useNf2tTable } from '../../hooks/useNf2tTable';
import { useNf2tContext } from '../../hooks/useNf2tContext';
import { FileUploadOutlined } from '@mui/icons-material';
import { findCoreAttributes, FlowFile } from '@nf2t/flowfiletools-js';
import {downloadAllUnpackaged}  from '../../utils/downloadAllUnpackaged';
import useUnpackageOnUpload from '../../hooks/useUnpackageOnUpload';
import { Link as MuiLink } from "@mui/material";

export const Route = createLazyRoute("/unpackageBulk")({
    component: BulkUnPackageNifi,
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

export interface BulkUnpackageDownloadButtonsProps extends Nf2tSnackbarProps {
    rows: FlowFile[],
    attributes: string[] | undefined,
}

export function BulkUnpackageDownloadReportButton({ submitSnackbarMessage, rows, attributes }: BulkUnpackageDownloadButtonsProps) {
    const onClickDownloadReport = () => {
        if (attributes == undefined) {
            submitSnackbarMessage("No attributes provided.", "error");
            return;
        }

        let content = attributes.map(x => JSON.stringify(x)).join(",");
        content += "\n";

        for (const row of rows) {
            const coreAttributes = findCoreAttributes(row.attributes);

            for (const attribute of attributes) {
                content += JSON.stringify(coreAttributes[attribute] || "")
                content += ","
            }
            content += "\n"
        }

        const blob = new Blob([content], {
            type: "text/csv",
        })

        downloadFile(new File([blob], "bulk.csv"));
        submitSnackbarMessage("Downloaded bulk report.", "info");
    }

    const onClickIsntDownloadable = () => {
        submitSnackbarMessage("No attributes to download", "error")
    };

    const isntDownloadable = rows.length <= 0 || attributes == undefined || attributes.length <= 0;
    const onClick = isntDownloadable ? onClickIsntDownloadable: onClickDownloadReport;

    return (
        <Button startIcon={ isntDownloadable ? <SyncProblemIcon /> : <CloudDownloadIcon />} variant="outlined" onClick={onClick}>Download Report</Button>
    )
}

export function BulkUnpackageDownloadAllButton({ submitSnackbarMessage, rows, attributes }: BulkUnpackageDownloadButtonsProps) {
    let hasIssue = false;    
    let onClick = async () => {
        const directoryHandle = await window.showDirectoryPicker();
        await downloadAllUnpackaged({
            directoryHandle: directoryHandle,
            rows: rows,
        });
        submitSnackbarMessage(`Completed download to ${directoryHandle.name}`, "success");
    };
    if(typeof window.showDirectoryPicker == "undefined") {
        hasIssue = true;
        onClick = async () => {
            submitSnackbarMessage("Your browser doesn't support the showDirectoryPicker API", "error")
        };
    } else if(rows.length <= 0 || attributes == undefined || attributes.length <= 0) {
        hasIssue = true;
        onClick = async () => {
            submitSnackbarMessage("No attributes to download", "error")
        };
    }

    return (
        <Button startIcon={ hasIssue ? <SyncProblemIcon /> : <CloudDownloadIcon />} variant="outlined" onClick={onClick}>Download All Content and Attributes</Button>
    )
}

export function BulkUnpackageDownloadButtons(props: BulkUnpackageDownloadButtonsProps) {
    return (
        <ButtonGroup>
            <BulkUnpackageDownloadReportButton {...props} />
            <BulkUnpackageDownloadAllButton {...props}  />
        </ButtonGroup>
    )
    
}

export function BulkUnPackageNifi() {
    const snackbarResults = useNf2tSnackbar();
    const { submitSnackbarMessage } = snackbarResults;
    const [ total, setTotal ] = useState(defaultTotal);
    const [ current, setCurrent ] = useState(defaultCurrent);
    const { unpackagedRows, setUnpackagedRows: setRows } = useNf2tContext();

    const attributes: string[] = useMemo(() => {
        if(unpackagedRows.length <= 0) {
            return [];
        }

        const results = new Set<string>();
        for(const row of unpackagedRows) {
            for(const [attribute] of row.attributes) {
                results.add(attribute);
            }
        }

        if (results.size <= 0) {
            submitSnackbarMessage("Did not find any attributes in the given files.",
                "error",
                {
                    uniqueAttributes: results.size,
                    rows: unpackagedRows,
                });
        }

        return Array.from(results);
    }, [unpackagedRows, submitSnackbarMessage]);

    const columns: Nf2tTableColumnSpec<FlowFile, undefined>[] = useMemo(() => {
        const results: Nf2tTableColumnSpec<FlowFile, undefined>[] = [];
        if(attributes == undefined) {
            return results;
        }

        results.push({
            columnName: "Edit",
            bodyRow: ({row, rowIndex}) => {
                const coreAttributes = findCoreAttributes(row.attributes);

                return <Link to="/unpackage" search={{index: rowIndex}}><MuiLink component="span">{coreAttributes.filename || `FlowFile ${rowIndex + 1}`}</MuiLink></Link>
            },
            rowToString: () => "Edit",
        });

        for(const attribute of attributes) {
            results.push({
                columnName: attribute,
                bodyRow: ({row}) => {
                    // TODO: This is slow...
                    const coreAttributes = findCoreAttributes(row.attributes);
                    return coreAttributes[attribute] || "";
                },
                rowToString: (row: FlowFile) => {
                    // TODO: This is slow...
                    const coreAttributes = findCoreAttributes(row.attributes);
                    return coreAttributes[attribute] || "";
                },
            });
        }
        
        return results;
    }, [attributes]);

    const tableProps = useNf2tTable<FlowFile, undefined>({
        childProps: undefined,
        snackbarProps: snackbarResults,
        canEditColumn: true,
        columns: columns,
        rows: unpackagedRows,
        ignoreNoColumnsError: true,
    });

    const resetProgress = useCallback(() => {
        tableProps.restoreDefaultFilteredColumns();
        setTotal(defaultTotal);
        setCurrent(defaultCurrent);
    }, [tableProps])
    
    const onUpload = useUnpackageOnUpload({
        resetProgress: resetProgress,
        submitSnackbarMessage: submitSnackbarMessage,
        setCurrent: setCurrent,
        setTotal: setTotal,
        setUnpackagedRows: setRows,
    });
    
    const clearFlowFiles = useCallback(() => {
        setRows([]);
    }, [setRows]);

    return (
        <>
            <Nf2tHeader to="/unpackageBulk" />
            <h5>1. Packaged FlowFiles</h5>
            <p>Upload FlowFiles.</p>
            <IconButton component="label">
                <FileUploadOutlined />
                <input
                    multiple={true}
                    style={{ display: "none" }}
                    type="file"
                    hidden
                    onChange={onUpload}
                />
            </IconButton>
            <p>Clear provided FlowFiles.</p>
            <Button variant="outlined" onClick={clearFlowFiles}>Clear</Button>
            <Spacing />
            <LinearProgressWithLabel current={current} total={total} />
            <Spacing />

            <h5>2. Review FlowFiles</h5>  
            <p>Click on the columns to change the FlowFile attribute being viewed.</p> 
            {(attributes.length > 0) && (
               <Nf2tTable {...tableProps} />
            )}
            <Spacing />

            <h5>3. Download FlowFile Attributes CSV</h5>
            <p>A CSV will be downloadable with all of the FlowFile attributes for each FlowFile provided. This may take some time.</p>
            <BulkUnpackageDownloadButtons {...snackbarResults} rows={unpackagedRows} attributes={attributes} />
            <Spacing />
            <Nf2tSnackbar {...snackbarResults} />
        </>
    )
}

export default BulkUnPackageNifi;