import { Link, createLazyRoute } from "@tanstack/react-router";
import { Link as MuiLink } from "@mui/material";
import Nf2tHeader from "../../components/Nf2tHeader";
import Nf2tTable from "../../components/Nf2tTable";
import { useNf2tSnackbar } from "../../hooks/useNf2tSnackbar";
import { useNf2tContext } from "../../hooks/useNf2tContext";
import { useNf2tTable } from "../../hooks/useNf2tTable";
import NarReaderBackLink from "../../components/NarReaderBackLink";

export const routeId = "/tagList";
export const Route = createLazyRoute(routeId)({
    component: RouteComponent,
});

export default function RouteComponent() {
    const { queryResults } = useNf2tContext();
    const snackbarProps = useNf2tSnackbar();

    const tableProps = useNf2tTable({
        childProps: undefined,
        rows: queryResults.data?.tags || [],
        snackbarProps: snackbarProps,
        columns: [
            {
                columnName: "Tag",
                bodyRow: ({ row }) => <Link search={{ tag: row[0] }} to="/extensionList"><MuiLink component="span">{row[0]}</MuiLink></Link>,
                rowToString: (row) => row[0],
            },
            {
                columnName: "Count",
                bodyRow: ({ row }) => row[1],
                rowToString: (row) => row[1].toString(),
                compareFn: (a, b) => b[1] - a[1],
            },
        ],
        canEditColumn: false,
    });

    return (
        <>
            <Nf2tHeader to={routeId} />
            <p><NarReaderBackLink /></p>

            <Nf2tTable {...tableProps} />
        </>
    )
}