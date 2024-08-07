import { Paper, Table, TableBody, TableCell, TableContainer, TableRow } from "@mui/material";
import Nf2tHeader from "../../components/Nf2tHeader";
import { Link, createLazyRoute, getRouteApi } from "@tanstack/react-router";
import { useMemo } from "react";
import { useNf2tContext } from "../../hooks/useNf2tContext";

//TODO: Do this more often?
const routeId = "/attributeLookup" as const;

const route = getRouteApi(routeId);

export const Route = createLazyRoute(routeId)({
    component: LookupAttribute,
})

export default function LookupAttribute() {
    const { id } = route.useSearch();
    const { queryResults } = useNf2tContext();

    const queryResult = useMemo(() => {
        if (!id) {
            return null;
        }

        if (!queryResults.data) {
            return null;
        }

        const attributeResults = queryResults.data.attributes.filter(x => x.id === id);
        if (attributeResults.length !== 1) {
            return null;
        }

        const attribute = attributeResults[0];

        const extensionResults = queryResults.data.extensions.filter(x => x.name === attribute.extensionId);
        if (extensionResults.length !== 1) {
            return null;
        }

        const extension = extensionResults[0];

        const narResults = queryResults.data.extensions.filter(x => x.name === attribute.narId);
        if (narResults.length !== 1) {
            return null;
        }

        const nar = narResults[0];

        return {
            attribute: attribute,
            extension: extension,
            nar: nar,
        }

    }, [queryResults.data, id]);

    return (
        <>
            <Nf2tHeader to={routeId} />
            {/* <p>The {extension?.name} was found when processing. <Link to="/narReader">Navigate here to reprocess the nars</Link>.</p> */}

            <h4>Nar Extension Information</h4>

            {queryResult ? (
                <>
                    <TableContainer component={Paper}>
                        <Table>
                            <TableBody>
                                <TableRow>
                                    <TableCell>name</TableCell>
                                    <TableCell>{queryResult?.attribute.name}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>type</TableCell>
                                    <TableCell>{queryResult?.attribute.type}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>description</TableCell>
                                    <TableCell>{queryResult?.attribute.description}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>Nar</TableCell>
                                    <TableCell><Link search={{ name: queryResult?.nar.name }} to="/narLookup">{queryResult?.nar.name}</Link></TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>Extension</TableCell>
                                    <TableCell><Link search={{ name: queryResult?.attribute.extensionId }} to="/extensionLookup">{queryResult?.extension.name}</Link></TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>More examples</TableCell>
                                    <TableCell><Link search={{ name: queryResult?.attribute.id || "" }} to="/attributesLookup">{queryResult?.attribute.name}</Link></TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </TableContainer>
                </>
            ) : (
                <p style={{color: "red"}}>Unable to find any information for attribute with id: {id}.</p>
            )}
        </>
    )
}