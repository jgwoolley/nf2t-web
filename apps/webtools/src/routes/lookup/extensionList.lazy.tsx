import { Link, createLazyRoute } from "@tanstack/react-router";
import Nf2tHeader from "../../components/Nf2tHeader";
import Nf2tTable from "../../components/Nf2tTable";
import { useNf2tSnackbar } from "../../hooks/useNf2tSnackbar";
import { useNf2tContext } from "../../hooks/useNf2tContext";
import { useNf2tTable } from "../../hooks/useNf2tTable";
import { useMemo } from "react";
import { Link as MuiLink } from "@mui/material";
import NarReaderBackLink from "../../components/NarReaderBackLink";

export const routeId = "/extensionList";
export const Route = createLazyRoute(routeId)({
    component: RouteComponent,
});

export default function RouteComponent() {
    const { queryResults } = useNf2tContext();
    const snackbarProps = useNf2tSnackbar();
    const { tag } = Route.useSearch();

    const rows = useMemo(() => {
        if(!queryResults.data) {
            return [];
        }

        if(tag == undefined || tag.length === 0) {
            return queryResults.data.extensions;
        }

        return queryResults.data.extensions.filter(extension => {
            for(const localTag of extension.tags) {
                if(localTag === tag) {
                    return true;
                }
            }
            return false;
        });

    }, [queryResults.data, tag])

    const tableProps = useNf2tTable({
        childProps: undefined,
        rows: rows,
        snackbarProps: snackbarProps,
        columns: [
            {
                columnName: "Nar",
                bodyRow: ({ row }) => <Link search={{ name: row.narId }} to="/narLookup"><MuiLink component="span">{row.narId}</MuiLink></Link>,
                rowToString: (row) => row.name,
            },
            {
                columnName: "Extension",
                bodyRow: ({ row }) => <Link search={{ name: row.name }} to="/extensionLookup"><MuiLink component="span">{row.name}</MuiLink></Link>,
                rowToString: (row) => row.name,
            },
            {
                columnName: "Type",
                bodyRow: ({ row }) => row.type,
                rowToString: (row) => row.type,
            },
        ],
        canEditColumn: false,
    });

    return (
        <>
            <Nf2tHeader to={routeId} />
            <p><NarReaderBackLink /></p>
            {tag && (<p>Tag Filter selected: <b>{tag}</b>. <Link to="/extensionList"><MuiLink component="span">Click here to clear tag filter.</MuiLink></Link></p>)}
            <Nf2tTable {...tableProps} />
        </>
    )
}