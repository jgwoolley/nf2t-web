import { useMemo } from "react";
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import { Link, createLazyRoute, getRouteApi } from "@tanstack/react-router";
import Nf2tHeader from "../../components/Nf2tHeader";
import ExternalLink from "../../components/ExternalLink";
import { useNf2tContext } from "../../hooks/useNf2tContext";
import { nf2tAttributes } from "../../utils/nf2tAttributes";
import { coreAttributes } from "../../utils/coreAttributes";

const route = getRouteApi("/attributesLookup");

export const Route = createLazyRoute("/attributesLookup")({
    component: LookupAttribute,
})

export default function LookupAttribute() {
    
    const { name } = route.useSearch();
    const { queryResults } = useNf2tContext();
    const attributes = useMemo(() => {
        if(!queryResults.data){
            return [];
        }

        return  queryResults.data.attributes.filter(x => x.name === name);
    }, [queryResults.data, name]);

    const nf2tAttributeDescription = name ? nf2tAttributes.get(name) : null;
    const coreAttributeDescription = name ? coreAttributes.get(name) : null;

    return (
        <>
            <Nf2tHeader to="/attributesLookup" />

            {(nf2tAttributeDescription) && (
                <>
                    <h5>Attributes from Nf2t Tool</h5>
                    <Table>
                        <TableBody>
                            <TableCell>{name}</TableCell>
                            <TableCell>{nf2tAttributeDescription}</TableCell>
                        </TableBody>
                    </Table>
                </>
            )}
            {(coreAttributeDescription) && (
                <>
                    <h5>Core Nifi Attributes</h5>
                    <p>See <ExternalLink href="https://github.com/apache/nifi/blob/main/nifi-api/src/main/java/org/apache/nifi/flowfile/attributes/CoreAttributes.java">CoreAttributes.java</ExternalLink>.</p>
                    <Table>
                        <TableBody>
                            <TableCell>{name}</TableCell>
                            <TableCell>{coreAttributeDescription}</TableCell>
                        </TableBody>
                    </Table>
                </>
            )}

            <h5>Attributes from Nars</h5>

            {attributes.length > 0 ? (
                <>
                    <p>The {name} attribute was found on the following Nifi Processors. <Link to="/narReader">Navigate to other attributes.</Link></p>
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Name</TableCell>
                                    <TableCell>Nar</TableCell>
                                    <TableCell>Extension</TableCell>
                                    <TableCell>Type</TableCell>
                                    <TableCell>Description</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {attributes.map((attribute, attributeIndex) => (
                                    <TableRow key={attributeIndex}>
                                    <TableCell>
                                        <Link to="/attributeLookup" search={{ id: attribute.id }}>{attribute.name}</Link>
                                    </TableCell>
                                    <TableCell>
                                        <Link to="/narLookup" search={{ name: attribute.narId }}>{attribute.narId}</Link>
                                    </TableCell>
                                    <TableCell>
                                        <Link to="/extensionLookup" search={{ name: attribute.extensionId }}>{attribute.extensionId}</Link>
                                    </TableCell>
                                    <TableCell>{attribute.type}</TableCell>
                                    <TableCell>{attribute.description}</TableCell>
                                </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </>
            ) : (
                <p>Did not find attribute "{name}" amoung the already parsed Nifi processors. <Link to="/narReader">Navigate here to parse additional Nars.</Link></p>
            )}
        </>
    )
}