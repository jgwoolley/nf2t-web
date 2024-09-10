import { Box, Button, ButtonGroup, IconButton, LinearProgress, Tooltip, Typography } from '@mui/material';
import { ChangeEvent, useCallback, useMemo, useState } from 'react';
import unpackageFlowFile from '../../utils/unpackageFlowFile';
import Spacing from '../../components/Spacing';
import { downloadFile } from '../../utils/downloadFile';
import Nf2tHeader from '../../components/Nf2tHeader';
import Nf2tSnackbar from "../../components/Nf2tSnackbar";

import { Nf2tSnackbarProps, useNf2tSnackbar } from "../../hooks/useNf2tSnackbar";
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import SyncProblemIcon from "@mui/icons-material/SyncProblem";
import { createLazyRoute } from '@tanstack/react-router';
import Nf2tTable from '../../components/Nf2tTable';
import downloadAllUnpackaged, { BulkUnpackageRow, findFilename, findMimetype } from '../../utils/downloadAllUnpackaged';
import { Nf2tTableColumnSpec, useNf2tTable } from '../../hooks/useNf2tTable';
import { useNf2tContext } from '../../hooks/useNf2tContext';
import { FileUploadOutlined } from '@mui/icons-material';

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
    rows: BulkUnpackageRow[],
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
            for (const attribute of attributes) {
                content += JSON.stringify(row.attributes[attribute] || "")
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
    const [total, setTotal] = useState(defaultTotal);
    const [current, setCurrent] = useState(defaultCurrent);
    const {unpackagedRows: rows, setUnpackagedRows: setRows} = useNf2tContext();

    const attributes: string[] = useMemo(() => {
        if(rows.length <= 0) {
            return [];
        }

        const results = new Set<string>();
        for(const row of rows) {
            for(const attribute of Object.entries(row.attributes)) {
                results.add(attribute[0])
            }
        }

        if (results.size <= 0) {
            submitSnackbarMessage("Did not find any attributes in the given files.",
                "error",
                {
                    uniqueAttributes: results.size,
                    rows: rows,
                });
        }

        return Array.from(results);
    }, [rows, submitSnackbarMessage]);

    const columns: Nf2tTableColumnSpec<BulkUnpackageRow, undefined>[] = useMemo(() => {
        const results: Nf2tTableColumnSpec<BulkUnpackageRow, undefined>[] = [];
        if(attributes == undefined) {
            return results;
        }

        results.push({
            columnName: "Edit",
            bodyRow: ({row}) => {
                return (
                    <ButtonGroup>
                        <Button 
                            startIcon={<CloudDownloadIcon />}
                            variant="outlined"
                            onClick={() => {
                                  
                                const blob = new Blob([JSON.stringify(row.attributes)], {
                                    type: "application/json",
                                });
                                downloadFile(blob, (row.attributes["filename"] || "attributes") + ".json");
                                snackbarResults.submitSnackbarMessage("downloaded flowfile content.", "info");

                            }}
                        >Attributes</Button>
                        <Button 
                            startIcon={<CloudDownloadIcon />}
                            onClick={async () => {
                                const filename = findFilename(row);
                                const mimetype = findMimetype(row);
            
                                const results = unpackageFlowFile(await row.file.arrayBuffer());
                                if(results == undefined) {
                                    return;
                                }

                                const blob = new Blob([results.content], {
                                    type: mimetype,
                                });
                                downloadFile(blob, filename);
                                snackbarResults.submitSnackbarMessage("downloaded flowfile content.", "info");
                            }}
                            variant="outlined"
                        >Content</Button>
                    </ButtonGroup>
                )
            },
            rowToString: () => "Edit",
        });

        for(const attribute of attributes) {
            results.push({
                columnName: attribute,
                bodyRow: ({row}) => row.attributes[attribute] || "",
                rowToString: (row: BulkUnpackageRow) => row.attributes[attribute] || "",
            });
        }

        return results;
    }, [attributes, snackbarResults]);

    const tableProps = useNf2tTable<BulkUnpackageRow, undefined>({
        childProps: undefined,
        snackbarProps: snackbarResults,
        canEditColumn: true,
        columns: columns,
        rows: rows,
        ignoreNoColumnsError: true,
    });

    const resetProgress = useCallback(() => {
        tableProps.restoreDefaultFilteredColumns();
        setTotal(defaultTotal);
        setCurrent(defaultCurrent);
    }, [tableProps])
    
    const onUpload = useCallback(async (e: ChangeEvent<HTMLInputElement>) => {
        try {
            resetProgress();
            const files = e.target.files;
            if (files === null || files.length < 1) {
                submitSnackbarMessage(`At least one FlowFile should be provided: ${files?.length}.`, "error")
                return;
            }
            setCurrent(0);
            setTotal(files.length);

            const newRows: BulkUnpackageRow[] = [];
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
                            newRows.push({
                                attributes: result.attributes,
                                file: file,
                            });
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
            setRows([...newRows]);
        } catch (error) {
            submitSnackbarMessage("Unknown error.", "error", error);
        }
    }, [resetProgress, setRows, submitSnackbarMessage])
    
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
            {(attributes.length > 0) && (
               <Nf2tTable {...tableProps} />
            )}
            <Spacing />

            <h5>3. Download FlowFile Attributes CSV</h5>
            <p>A CSV will be downloadable with all of the FlowFile attributes for each FlowFile provided. This may take some time.</p>
            <BulkUnpackageDownloadButtons {...snackbarResults} rows={rows} attributes={attributes} />
            <Spacing />
            <Nf2tSnackbar {...snackbarResults} />
        </>
    )
}

export default BulkUnPackageNifi;