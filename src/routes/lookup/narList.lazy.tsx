import { Link, createLazyRoute } from "@tanstack/react-router";
import Nf2tHeader from "../../components/Nf2tHeader";
import { useNf2tContext } from "../../components/Nf2tContextProvider";
import Nf2tTable, { useNf2tTable } from "../../components/Nf2tTable";
import { useNf2tSnackbar } from "../../components/Nf2tSnackbar";

export const routeId = "/narList";
export const Route = createLazyRoute(routeId)({
    component: RouteComponent,
})

export default function RouteComponent() {
    const { nars } = useNf2tContext();
    const snackbarProps = useNf2tSnackbar();
    const tableProps = useNf2tTable({
        childProps: undefined,
        rows: nars,
        snackbarProps:snackbarProps,
        columns: [
            {
                columnName: "Nar",
                bodyRow: ({row, rowIndex}) => <Link search={{ nar_index: rowIndex }} to="/narLookup">{row.name}</Link>,
                rowToString: (row) => row.name,
            },
            {
                columnName: "Last Modified",
                bodyRow: ({row}) => <>{row.lastModified}</>,
                compareFn: (a, b) => a.size - b.size,
                rowToString: (row) => row.lastModified.toLocaleString(),
            },
            {
                columnName: "Size",
                bodyRow: ({row}) => <>{row.size}</>,
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

            <Nf2tTable {...tableProps} />
        </>
    )
}