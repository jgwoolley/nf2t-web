import { Paper, Table, TableBody, TableCell, TableContainer, TableRow } from "@mui/material";
import Nf2tHeader from "../../components/Nf2tHeader";
import { Link, createLazyRoute, getRouteApi } from "@tanstack/react-router";
import { useMemo } from "react";
import { useNf2tContext } from "../../hooks/useNf2tContext";
import { Nar, NarAttribute, NarExtension } from "../../utils/readNars";

//TODO: Do this more often?
const routeId = "/attributeLookup" as const;

const route = getRouteApi(routeId);

export const Route = createLazyRoute(routeId)({
    component: LookupAttribute,
})

type LookupAttributeResult = {
    attribute: NarAttribute | null,
    extension: NarExtension | null,
    nar: Nar | null,
}

export default function LookupAttribute() {
    const { id } = route.useSearch();
    const { queryResults } = useNf2tContext();

    const { attribute, extension, nar }: LookupAttributeResult = useMemo(() => {
        const result: LookupAttributeResult = {
            attribute: null,
            extension: null,
            nar: null,
        }

        if (!id) {
            return result;
        }

        if (!queryResults.data) {
            return result;
        }

        const attributeResults = queryResults.data.attributes.filter(x => x.id === id);
        if (attributeResults.length !== 1) {
            return result;
        }

        const attribute = attributeResults[0];
        result.attribute = attribute;

        const extensionResults = queryResults.data.extensions.filter(x => x.name === attribute.extensionId);
        if (extensionResults.length === 1) {
            result.extension = extensionResults[0];
        }

        const narResults = queryResults.data.nars.filter(x => x.name === attribute.narId);
        if (narResults.length === 1) {
            result.nar = narResults[0];
        }

        return result;

    }, [queryResults.data, id]);

    return (
        <>
            <Nf2tHeader to={routeId} />
            <p><Link to="/narReader">Navigate here to reprocess the nars</Link>.</p>

            <h4>Nar Extension Information</h4>
            {attribute == undefined && <p style={{color: "red"}}>Could not lookup attribute.</p>}
            {extension == undefined && <p style={{color: "red"}}>Could not lookup extension.</p>}
            {nar == undefined && <p style={{color: "red"}}>Could not lookup nar.</p>}

            <TableContainer component={Paper}>
                <Table>
                    <TableBody>
                        {attribute && (
                            <>
                                <TableRow>
                                    <TableCell>name</TableCell>
                                    <TableCell>{attribute.name}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>type</TableCell>
                                    <TableCell>{attribute?.type}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>description</TableCell>
                                    <TableCell>{attribute?.description}</TableCell>
                                </TableRow>
                            </>
                        )}

                        {nar && (
                            <TableRow>
                                <TableCell>Nar</TableCell>
                                <TableCell>{nar ? <Link search={{ name: nar.name }} to="/narLookup">{nar.name}</Link> : "Could not find"} </TableCell>
                            </TableRow>
                        )}

                        {(extension && attribute) && (
                            <>
                                <TableRow>
                                    <TableCell>Extension</TableCell>
                                    <TableCell><Link search={{ name: attribute.extensionId }} to="/extensionLookup">{extension.name}</Link></TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>More examples</TableCell>
                                    <TableCell><Link search={{ name: attribute.name }} to="/attributesLookup">{attribute.name}</Link></TableCell>
                                </TableRow>
                            </>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </>
    )
}