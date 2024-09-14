import { useMemo } from "react"
import { Link, createLazyRoute } from "@tanstack/react-router";
import Nf2tHeader from "../../components/Nf2tHeader";
import { useNf2tContext } from "../../hooks/useNf2tContext";
import Nf2tTable from "../../components/Nf2tTable";
import { useNf2tSnackbar } from "../../hooks/useNf2tSnackbar";
import { useNf2tTable } from "../../hooks/useNf2tTable";
import NarReaderBackLink from "../../components/NarReaderBackLink";
import { Link as MuiLink } from "@mui/material";

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
                        <MuiLink>{row.name}</MuiLink>
                    </Link>
                ),
                rowToString: (row) => row.name,
            },
            {
                columnName: "Extension Count",
                bodyRow: ({row}) => (
                    <>{row.length}</>
                ),
                compareFn: (x, y) => x.length - y.length,
                rowToString: (row) => row.length.toString(),
            },
        ],
        canEditColumn: false,
    });

    return (
        <>
            <Nf2tHeader to="/attributeList" />
            <p><NarReaderBackLink /></p>

            <Nf2tTable {...tableProps} />
        </>
    )
}