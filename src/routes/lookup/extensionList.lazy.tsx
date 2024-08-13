import { Link, createLazyRoute } from "@tanstack/react-router";
import Nf2tHeader from "../../components/Nf2tHeader";
import Nf2tTable from "../../components/Nf2tTable";
import { useNf2tSnackbar } from "../../hooks/useNf2tSnackbar";
import { useNf2tContext } from "../../hooks/useNf2tContext";
import { useNf2tTable } from "../../hooks/useNf2tTable";
import { useMemo } from "react";

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
                bodyRow: ({ row }) => <Link search={{ name: row.narId }} to="/narLookup">{row.narId}</Link>,
                rowToString: (row) => row.name,
            },
            {
                columnName: "Extension",
                bodyRow: ({ row }) => <Link search={{ name: row.name }} to="/extensionLookup">{row.name}</Link>,
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
            <p><Link to="/narReader">Go back to NarReader</Link>.</p>
            {tag && (<p><Link to="/extensionList">Click here to clear tag filter</Link>.</p>)}
            <Nf2tTable {...tableProps} />
        </>
    )
}