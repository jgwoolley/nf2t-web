import { createLazyRoute, getRouteApi, Link } from "@tanstack/react-router";
import Nf2tHeader from "../../components/Nf2tHeader";
import { useNf2tContext } from "../../hooks/useNf2tContext";
import { useMemo } from "react";
import { Link as MuiLink, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import { convertBytes } from "../../utils/convertBytes";
import { useNf2tTable } from "../../hooks/useNf2tTable";
import { useNf2tSnackbar } from "../../hooks/useNf2tSnackbar";
import Nf2tTable from "../../components/Nf2tTable";
import { findCoreAttributes, FlowFileResult } from "@nf2t/flowfiletools-js";
import { UnpackagedFile } from "../../utils/schemas";
import UnpackageLink from "./UnpackageLink";

const routeId = "/unpackageFileLookup" as const;

export const Route = createLazyRoute(routeId)({
    component: ParentFileLookup,
})

const route = getRouteApi(routeId);

export function ParentFileLookup() {
    const { unpackagedFiles, unpackagedRows } = useNf2tContext();

    const { id } = route.useSearch();

    const parentFile = useMemo(() => {
        const results = unpackagedFiles.filter(x => x.id === id);
        if(results.length !== 1) return null;
        return results[0];
    }, [id, unpackagedFiles]);

    const grandParentFile = useMemo(() => {
        if(parentFile == undefined) return null;
        const results = unpackagedFiles.filter(x => x.id === parentFile.parentId);
        if(results.length !== 1) return null;
        return results[0];
    }, [parentFile, unpackagedFiles])

    const childFiles = useMemo(() => {
        if(id == undefined) return [];

        return unpackagedFiles.filter(x => x.parentId === id);

    }, [id, unpackagedFiles]);

    const childFlowFiles = useMemo(() => {
        if(id == undefined) return [];

        return unpackagedRows.filter(x => x.parentId === id);

    }, [id, unpackagedFiles]);

    const snackbarProps = useNf2tSnackbar();

    const childFileTableProps = useNf2tTable({
        childProps: undefined,
        snackbarProps: snackbarProps,
        minColumns: 1,
        columns: [
            {
                columnName: "File",
                bodyRow: ({row}) => {
                    return <Link to="/unpackageFileLookup" search={{ id: row.id }}><MuiLink component="span">{row.name}</MuiLink></Link>;
                },
                rowToString: function (row: UnpackagedFile): string {
                    return row.name;
                },
            },
            {
                columnName: "Size",
                bodyRow: ({row}) => {
                    return row.size;
                },
                compareFn: (a, b) => {
                    return b.size - a.size;
                },
                rowToString: function (row: UnpackagedFile): string {
                    return row.size.toString();
                },
            },
            {
                columnName: "MimeType",
                bodyRow: ({row}) => {
                    return row.type;
                },
                rowToString: function (row: UnpackagedFile): string {
                    return row.type;
                },
            },
        ],
        rows: childFiles,
        canEditColumn: false,
    });

    const childFlowFileTableProps = useNf2tTable({
        childProps: undefined,
        snackbarProps: snackbarProps,
        minColumns: 3,
        columns: [
            {
                columnName: "FlowFile",
                bodyRow: ({row, rowIndex}) => {
                    if(row.status === "success") {
                        const attributes = findCoreAttributes(row.attributes);
                        return attributes.filename || rowIndex;
                    } else {
                        return `Failed to parse: ${parentFile?.name || rowIndex}`;
                    }
                },
                rowToString: function (row: FlowFileResult, index: number): string {
                    return `${row.parentId}\t${index}`;
                },
            },
        ],
        rows: childFlowFiles,
        canEditColumn: false,
    });

    return <>
        <Nf2tHeader to={routeId} />
        <p><UnpackageLink /></p>

        {parentFile ? (
            <>
            <h3>File Properties</h3>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Field</TableCell>
                            <TableCell>Value</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {grandParentFile && (
                            <TableRow>
                                <TableCell>Parent</TableCell>
                                <TableCell><Link to={routeId} search={{ id: grandParentFile.id }}><MuiLink component="span">{grandParentFile.name}</MuiLink></Link></TableCell>
                            </TableRow>
                        )}
                       
                        <TableRow>
                            <TableCell>name</TableCell>
                            <TableCell>{parentFile.name}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>size</TableCell>
                            <TableCell>{convertBytes(parentFile.size)}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>mime.type</TableCell>
                            <TableCell>{parentFile.type}</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </TableContainer>

            {childFiles.length > 0 && (
                <>
                    <h3>File Children</h3>
                    <Nf2tTable {...childFileTableProps} />
                </>
            )}

            {childFlowFiles.length > 0 && (
                <>
                    <h3>FlowFile Children</h3>
                    <Nf2tTable {...childFlowFileTableProps} />
                </>
            )}
            
            </>
        ) : (
            <p>No File with that id.</p>
        )}
    </>;
}

export default ParentFileLookup;