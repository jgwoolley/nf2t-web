import { useMemo } from "react"
import { Link, createLazyRoute } from "@tanstack/react-router";
import Nf2tHeader from "../../components/Nf2tHeader";
import { useNf2tContext } from "../../hooks/useNf2tContext";
import Nf2tTable, { useNf2tTable } from "../../components/Nf2tTable";
import { useNf2tSnackbar } from "../../components/Nf2tSnackbar";

export const routeId = "/attributeList";
export const Route = createLazyRoute(routeId)({
    component: RouteComponent,
})

type UniqueAttributes = {
    name: string,
    length: number,
}

export default function RouteComponent() {
    const snackbarProps = useNf2tSnackbar();
    const { queryResults } = useNf2tContext();

    const uniqueAttributes = useMemo<UniqueAttributes[]>(() => {
        if(!queryResults.data) {
            return [];
        }

        const result: Map<string, number> = new Map();

        for(const attribute of queryResults.data.attributes) {
            result.set(attribute.name, 1 + (result.get(attribute.name) || 0));     
        }

        return Array.from(result.entries()).map(x => { return {name: x[0], length: x[1]}});

    },[queryResults.data]);

    const tableProps = useNf2tTable({
        childProps: undefined,
        rows: uniqueAttributes,
        snackbarProps: snackbarProps,
        columns: [
            {
                columnName: "Attribute",
                bodyRow: ({row}) => (
                    <Link to="/attributesLookup" search={{ name: row.name }}>
                        {row.name}
                    </Link>
                ),
                rowToString: (row) => row.name,
            },
            {
                columnName: "Extension Count",
                bodyRow: ({row}) => (
                    <>{row.length}</>
                ),
                rowToString: (row) => row.length.toString(),
            },
        ],
        canEditColumn: false,
    });

    return (
        <>
            <Nf2tHeader to="/attributeList" />
            <p><Link to="/narReader">Go back to NarReader</Link>.</p>

            <Nf2tTable {...tableProps} />
        </>
    )
}