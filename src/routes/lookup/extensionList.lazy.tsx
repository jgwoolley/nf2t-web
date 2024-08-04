import { Link, createLazyRoute } from "@tanstack/react-router";
import Nf2tHeader from "../../components/Nf2tHeader";
import { useNf2tContext } from "../../components/Nf2tContextProvider";
import Nf2tTable, { useNf2tTable } from "../../components/Nf2tTable";
import { useNf2tSnackbar } from "../../components/Nf2tSnackbar";
import { Nar, NarExtension } from "../../utils/readNars";

export const routeId = "/extensionList";
export const Route = createLazyRoute(routeId)({
    component: RouteComponent,
})

type ExtensionWithNar = {
    nar_index: number,
    extension_index: number,
    nar: Nar,
    extension: NarExtension,
}

export default function RouteComponent() {
    const { nars } = useNf2tContext();

    const extensions: ExtensionWithNar[] = [];

    nars.forEach((nar, nar_index) => {
        nar.extensions.forEach((extension, extension_index) => {
            extensions.push({
                nar_index,
                extension_index,
                nar,
                extension,
            })
        });
    });


    const snackbarProps = useNf2tSnackbar();
    const tableProps = useNf2tTable({
        childProps: undefined,
        rows: extensions,
        snackbarProps:snackbarProps,
        columns: [
            {
                columnName: "Nar",
                bodyRow: ({row}) => <Link search={{ nar_index: row.nar_index}} to="/narLookup">{row.nar.name}</Link>,
                rowToString: (row) => row.extension.name,
            },
            {
                columnName: "Extension",
                bodyRow: ({row}) => <Link search={{ nar_index: row.nar_index, extension_index: row.extension_index}} to="/extensionLookup">{row.extension.name}</Link>,
                rowToString: (row) => row.extension.name,
            },
        ],
        canEditColumn: false,
    });

    return (
        <>
            <Nf2tHeader to={routeId} />
            <p><Link to="/narReader">Go back to NarReader</Link>.</p>

            <Nf2tTable {...tableProps} />
        </>
    )
}