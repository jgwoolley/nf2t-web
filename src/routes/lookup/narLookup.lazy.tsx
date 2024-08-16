import { Table, TableBody, TableCell, TableRow } from "@mui/material";
import Nf2tHeader from "../../components/Nf2tHeader";
import { Link, createLazyRoute, getRouteApi } from "@tanstack/react-router";
import { convertBytes } from "../../utils/convertBytes";
import { convertDate } from "../../utils/convertDates";
import { useNf2tContext } from "../../hooks/useNf2tContext";
import { useMemo } from "react";
import Nf2tTable from "../../components/Nf2tTable";
import { useNf2tSnackbar } from "../../hooks/useNf2tSnackbar";
import { useNf2tTable } from "../../hooks/useNf2tTable";
import ExtensionTagCell from "../../components/ExtensionTagCell";

const route = getRouteApi("/narLookup");

export const Route = createLazyRoute("/narLookup")({
    component: LookupNar,
})

export default function LookupNar() {
    const { name } = route.useSearch();
    const { queryResults } = useNf2tContext();
    const snackbarProps = useNf2tSnackbar();

    const extensions = useMemo(()=>{
        if(!queryResults.data) {
            return []
        }

        return queryResults.data.extensions.filter(extension => extension.narId === name);
    }, [queryResults.data, name]);

    const tableProps = useNf2tTable({
        childProps: undefined,
        rows: extensions,
        snackbarProps: snackbarProps,
        columns: [
            {
                columnName: "Extension",
                bodyRow: ({row}) => <Link search={{ name: row.name }} to="/extensionLookup">{row.name}</Link>,
                rowToString: (row) => row.name,
            },
            {
                columnName: "Type",
                bodyRow: ({row}) => row.type,
                rowToString: (row) => row.type,
            },
            {
                columnName: "Description",
                bodyRow: ({row}) => row.description,
                rowToString: (row) => row.description || "",
            },
        ],
        canEditColumn: false,
    });

    const tags = useMemo(()=>{
        const tags = new Set<string>();
        for(const extension of extensions) {
            for(const tag of extension.tags) {
                tags.add(tag);
            }
        }

        return Array.from(tags);
    }, [extensions]);

    const nar = useMemo(() => {
        if(!name) {
            return null;
        }
        if(!queryResults.data) {
            return null;
        }
        const nars = queryResults.data.nars.filter(nar => nar.name === name);
        if(nars.length !== 1){
            throw new Error("No data");
        }
    
        return nars[0];
    }, [name, queryResults.data]);

    const propertiesTableProps = useNf2tTable({
        childProps: undefined,
        rows: nar ? Object.entries(nar.manifest) : [],
        snackbarProps: snackbarProps,
        columns: [
            {
                columnName: "Key",
                bodyRow: ({row}) => row[0],
                rowToString: (row) => row[0],
            },
            {
                columnName: "Value",
                bodyRow: ({row}) => row[1],
                rowToString: (row) => row[1],
            },
        ],
        canEditColumn: false,
    });


    return (
        <>
            <Nf2tHeader to="/narLookup" />
            <p>The {nar?.name} was found when processing. <Link to="/narReader">Navigate here to reprocess the nars</Link>.</p>

            <h4>Nar Information</h4>

            <Table>
                <TableBody>
                    <TableRow>
                        <TableCell>name</TableCell>
                        <TableCell>{nar?.name}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>lastModified</TableCell>
                        <TableCell>{convertDate(nar?.lastModified)}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>size</TableCell>
                        <TableCell>{convertBytes(nar?.size)}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>groupId</TableCell>
                        <TableCell>{nar?.groupId}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>artifactId</TableCell>
                        <TableCell>{nar?.artifactId}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>version</TableCell>
                        <TableCell>{nar?.version}</TableCell>
                    </TableRow>
                    {nar?.buildTag && (
                        <TableRow>
                            <TableCell>buildTag</TableCell>
                            <TableCell>{nar?.buildTag}</TableCell>
                        </TableRow>
                    )}
                    {nar?.buildTimestamp && (
                        <TableRow>
                            <TableCell>buildTimestamp</TableCell>
                            <TableCell>{nar?.buildTimestamp}</TableCell>
                        </TableRow>
                    )}
                    {tags.length <= 0 && (
                        <TableRow>
                            <TableCell>tags</TableCell>
                            <TableCell><ExtensionTagCell tags={tags}/></TableCell>
                        </TableRow>
                    )}

                </TableBody>
            </Table>

            <h4>Nar Extensions</h4>

            <Nf2tTable {...tableProps} />

            <h4>Nar Manifest Properties</h4>
            <Nf2tTable {...propertiesTableProps} />
        </>
    )
}