import { Button, ButtonGroup } from '@mui/material';
import { useMemo } from 'react';
import Spacing from '../../components/Spacing';
import { downloadFile } from '../../utils/downloadFile';
import Nf2tHeader from '../../components/Nf2tHeader';
import Nf2tSnackbar from "../../components/Nf2tSnackbar";
import { Nf2tSnackbarProps, useNf2tSnackbar } from "../../hooks/useNf2tSnackbar";
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import SyncProblemIcon from "@mui/icons-material/SyncProblem";
import { createLazyRoute, getRouteApi, Link } from '@tanstack/react-router';
import Nf2tTable from '../../components/Nf2tTable';
import { Nf2tTableColumnSpec, useNf2tTable } from '../../hooks/useNf2tTable';
import { useNf2tContext } from '../../hooks/useNf2tContext';
import { findCoreAttributes, FlowFileResult } from '@nf2t/flowfiletools-js';
import { downloadAllUnpackaged } from '../../utils/downloadAllUnpackaged';
import { Link as MuiLink } from "@mui/material";
import UnpackageLink from './UnpackageLink';

const routeId = "/unpackageFlowFileList" as const;

export const Route = createLazyRoute(routeId)({
    component: BulkUnPackageNifi,
})

const route = getRouteApi(routeId);

export interface BulkUnpackageDownloadButtonsProps extends Nf2tSnackbarProps {
    rows: FlowFileResult[],
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
            if (row.status !== "success") {
                continue;
            }
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
    const onClick = isntDownloadable ? onClickIsntDownloadable : onClickDownloadReport;

    return (
        <Button startIcon={isntDownloadable ? <SyncProblemIcon /> : <CloudDownloadIcon />} variant="outlined" onClick={onClick}>Download Report</Button>
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
    if (typeof window.showDirectoryPicker == "undefined") {
        hasIssue = true;
        onClick = async () => {
            submitSnackbarMessage("Your browser doesn't support the showDirectoryPicker API", "error")
        };
    } else if (rows.length <= 0 || attributes == undefined || attributes.length <= 0) {
        hasIssue = true;
        onClick = async () => {
            submitSnackbarMessage("No attributes to download", "error")
        };
    }

    return (
        <Button startIcon={hasIssue ? <SyncProblemIcon /> : <CloudDownloadIcon />} variant="outlined" onClick={onClick}>Download All Content and Attributes</Button>
    )
}

export function BulkUnpackageDownloadButtons(props: BulkUnpackageDownloadButtonsProps) {
    return (
        <ButtonGroup>
            <BulkUnpackageDownloadReportButton {...props} />
            <BulkUnpackageDownloadAllButton {...props} />
        </ButtonGroup>
    )

}

export function BulkUnPackageNifi() {
    const { id: parentId } = route.useSearch();
    const snackbarResults = useNf2tSnackbar();
    const { submitSnackbarMessage } = snackbarResults;
    const { unpackagedRows, unpackagedFiles } = useNf2tContext();

    const filteredRows = useMemo(() => {
        if(parentId) {
            return unpackagedRows.filter(x => parentId === x.parentId)
        }
        return unpackagedRows;
    }, [parentId, unpackagedRows])

    const attributes: string[] = useMemo(() => {
        if (filteredRows.length <= 0) {
            return [];
        }

        const results = new Set<string>();
        for (const row of filteredRows) {
            if (row.status !== "success") {
                continue;
            }
            for (const [attribute] of row.attributes) {
                results.add(attribute);
            }
        }

        return Array.from(results);
    }, [filteredRows, submitSnackbarMessage]);

    const columns: Nf2tTableColumnSpec<FlowFileResult, undefined>[] = useMemo(() => {
        const results: Nf2tTableColumnSpec<FlowFileResult, undefined>[] = [];

        results.push({
            columnName: "Parent File",
            bodyRow: ({ row }) => {
                const parentFiles = unpackagedFiles.filter(x => row.parentId === x.id);

                if(parentFiles.length !== 1) {
                    return "";
                }

                return <Link to="/unpackageFileLookup" search={{ id: row.parentId }}><MuiLink component="span">{parentFiles[0].name}</MuiLink></Link>
            },
            compareFn: (x, y) => x.parentId.localeCompare(y.parentId),
            rowToString: (row) => {
                const parentFiles = unpackagedFiles.filter(x => row.parentId === x.id);
                if(parentFiles.length !== 1) {
                    return "";
                }

                return parentFiles[0].id;
            },
        });

        results.push({
            columnName: "FlowFile",
            bodyRow: ({ row, rowIndex }) => {
                if (row.status === "error") {
                    return "Failed to parse.";
                }

                const coreAttributes = findCoreAttributes(row.attributes);

                return <Link to="/unpackageFlowFileLookup" search={{ index: rowIndex }}><MuiLink component="span">{coreAttributes.filename || `FlowFile ${rowIndex + 1}`}</MuiLink></Link>
            },
            rowToString: () => "Edit",
        });

        for (const attribute of attributes) {
            results.push({
                columnName: attribute,
                bodyRow: ({ row }) => {
                    if (row.status === "error") {
                        return <></>;
                    }
                    // TODO: This is slow...
                    const coreAttributes = findCoreAttributes(row.attributes);
                    return coreAttributes[attribute] || "";
                },
                rowToString: (row: FlowFileResult) => {
                    if (row.status === "error") {
                        return "";
                    }
                    // TODO: This is slow...
                    const coreAttributes = findCoreAttributes(row.attributes);
                    return coreAttributes[attribute] || "";
                },
            });
        }

        return results;
    }, [attributes]);

    const tableProps = useNf2tTable<FlowFileResult, undefined>({
        childProps: undefined,
        snackbarProps: snackbarResults,
        canEditColumn: true,
        columns: columns,
        rows: filteredRows,
        ignoreNoColumnsError: true,
        minColumns: 3,
    });

    return (
        <>
            <Nf2tHeader to="/unpackageFlowFileList" />

            <h5>1. Packaged FlowFiles</h5>
            <p><UnpackageLink /></p>
            { parentId && (
                <p><Link to="/unpackageFlowFileList"><MuiLink component="span">Currently filtering by parentId, click to clear filter.</MuiLink></Link></p>
            )}
            
            <h5>2. Review FlowFiles</h5>
            <p>Click on the columns to change the FlowFile attribute being viewed.</p>
            <Nf2tTable {...tableProps} />
            <Spacing />
            <h5>3. Download FlowFile Attributes CSV</h5>
            <p>A CSV will be downloadable with all of the FlowFile attributes for each FlowFile provided. This may take some time.</p>
            <BulkUnpackageDownloadButtons {...snackbarResults} rows={filteredRows} attributes={attributes} />
            <Spacing />
            <Nf2tSnackbar {...snackbarResults} />
        </>
    )
}

export default BulkUnPackageNifi;