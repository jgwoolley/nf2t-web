import { useNf2tContext } from "../../components/Nf2tContextProvider";
import { useMemo } from "react";
import { Table, TableBody, TableCell, TableRow } from "@mui/material";
import Nf2tHeader from "../../components/Nf2tHeader";
import { Nar, NarAttribute, NarExtension } from "../../utils/readNars";
import { Link, createLazyRoute, getRouteApi } from "@tanstack/react-router";

//TODO: Do this more often?
const routeId = "/attributeLookup" as const;

const route = getRouteApi(routeId);

export const Route = createLazyRoute(routeId)({
    component: LookupAttribute,
})

interface LookupExtensionMemo {
    extension: NarExtension,
    nar: Nar,
    attribute: NarAttribute,
}

export default function LookupAttribute() {
    const { nar_index, extension_index, attribute_index, type } = route.useSearch();
    const { nars } = useNf2tContext();
    
    const {nar, extension, attribute} = useMemo<LookupExtensionMemo>(() => {
        const newNar = nars[nar_index];
        const newExtension = newNar.extensions[extension_index];
        const newAttribute = newExtension[type][attribute_index];

        return {
            extension: newExtension,
            nar: newNar,
            attribute: newAttribute,
        }
    }, [nars, nar_index, extension_index, attribute_index]);

    return (
        <>
            <Nf2tHeader to="/extensionLookup" />
            <p>The {extension?.name} was found when processing. <Link to="/narReader">Navigate here to reprocess the nars</Link>.</p>

            <h4>Nar Extension Information</h4>

            <Table>
                <TableBody>
                    <TableRow>
                        <TableCell>name</TableCell>
                        <TableCell>{attribute?.name}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>type</TableCell>
                        <TableCell>{type}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>description</TableCell>
                        <TableCell>{attribute?.description}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>Nar</TableCell>
                        <TableCell><Link search={{nar_index: nar_index}} to="/narLookup">{nar?.name}</Link></TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>Extension</TableCell>
                        <TableCell><Link search={{nar_index: nar_index, extension_index: extension_index}} to="/extensionLookup">{extension?.name}</Link></TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>More examples</TableCell>
                        <TableCell><Link search={{name: attribute?.name}} to="/attributesLookup">{attribute?.name}</Link></TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </>
    )
}