import { Link, createLazyRoute } from "@tanstack/react-router";
import Nf2tHeader from "../../components/Nf2tHeader";
import Nf2tTable from "../../components/Nf2tTable";
import { useNf2tSnackbar } from "../../hooks/useNf2tSnackbar";
import { convertBytes } from "../../utils/convertBytes";
import { convertDate } from "../../utils/convertDates";
import { useNf2tContext } from "../../hooks/useNf2tContext";
import { useNf2tTable } from "../../hooks/useNf2tTable";
import { Link as MuiLink } from "@mui/material";
import NarReaderBackLink from "../../components/NarReaderBackLink";

export const routeId = "/narList";
export const Route = createLazyRoute(routeId)({
    component: RouteComponent,
})

export default function RouteComponent() {
    const { queryResults } = useNf2tContext();
    const snackbarProps = useNf2tSnackbar();
    const tableProps = useNf2tTable({
        childProps: undefined,
        rows: queryResults.data?.nars || [],
        snackbarProps:snackbarProps,
        columns: [
            {
                columnName: "Nar",
                bodyRow: ({row}) => <Link search={{ name: row.name }} to="/narLookup"><MuiLink component="span">{row.name}</MuiLink></Link>,
                rowToString: (row) => row.name,
            },
            {
                columnName: "Last Modified",
                bodyRow: ({row}) => <>{convertDate(row.lastModified)}</>,
                compareFn: (a, b) => a.size - b.size,
                rowToString: (row) => row.lastModified.toLocaleString(),
            },
            {
                columnName: "Size",
                bodyRow: ({row}) => <>{convertBytes(row.size)}</>,
                compareFn: (a, b) => a.size - b.size,
                rowToString: (row) => row.size.toLocaleString(),
            },
            {
                columnName: "groupId",
                bodyRow: ({row}) => <>{row.groupId}</>,
                rowToString: (row) => row.groupId || "",
            },
            {
                columnName: "artifactId",
                bodyRow: ({row}) => <>{row.artifactId}</>,
                rowToString: (row) => row.artifactId || "",
            },
            {
                columnName: "version",
                bodyRow: ({row}) => <>{row.version}</>,
                rowToString: (row) => row.version || "",
            },
            {
                columnName: "buildTag",
                bodyRow: ({row}) => <>{row.buildTag}</>,
                rowToString: (row) => row.buildTag || "",
            },
            {
                columnName: "buildTimestamp",
                bodyRow: ({row}) => <>{row.buildTimestamp}</>,
                rowToString: (row) => row.buildTimestamp || "",
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