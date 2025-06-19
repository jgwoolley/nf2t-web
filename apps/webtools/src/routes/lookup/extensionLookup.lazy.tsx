import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import Nf2tHeader from "../../components/Nf2tHeader";
import { NarAttributeType, NarAttributes, NarExtension } from "@nf2t/nifitools-js";
import { Link, createLazyRoute, getRouteApi } from "@tanstack/react-router";
import { useNf2tContext } from "../../hooks/useNf2tContext";
import { useMemo } from "react";
import ExtensionTagCell from "../../components/ExtensionTagCell";
import { Link as MuiLink } from "@mui/material";
import NarReaderBackLink from "../../components/NarReaderBackLink";

export const routeId = "/extensionLookup";
export const Route = createLazyRoute(routeId)({
    component: RouteComponent,
})
const localRoute = getRouteApi(routeId);

interface ExtensionAttributeTableProps {
    extension?: NarExtension | null,
    attributes?: NarAttributes | null,
    type: NarAttributeType,
    title: string,
}

function ExtensionAttributeTable({ type, title, attributes, }: ExtensionAttributeTableProps) {

    const filteredAttributes = useMemo(() => {
        if (attributes == undefined) {
            return null;
        }

        return attributes.filter(attribute => attribute.type === type);
    }, [attributes, type]);

    if (!filteredAttributes) {
        return null;
    }

    if (filteredAttributes.length <= 0) {
        return null;
    }

    return (
        <>
            <h3>{title}</h3>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Extension</TableCell>
                            <TableCell>Description</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredAttributes.map((attribute, attribute_index) => (
                            <TableRow key={attribute_index}>
                                <TableCell>
                                    <Link search={{ id: attribute.id }} to="/attributeLookup">
                                        <MuiLink component="span">{attribute.name}</MuiLink>
                                    </Link>
                                </TableCell>
                                <TableCell>{attribute.description}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </>
    )
}

export default function RouteComponent() {
    const { name } = localRoute.useSearch();
    const { queryResults } = useNf2tContext();

    const extension = useMemo(() => {
        if (!name) {
            return null;
        }
        if (!queryResults.data) {
            return null;
        }

        const extensions = queryResults.data.extensions.filter(extension => extension.name === name);
        if (extensions.length !== 1) {
            return null;
        }

        return extensions[0];
    }, [name, queryResults.data]);

    const attributes = useMemo(() => {
        if (!name) {
            return null;
        }
        if (!queryResults.data) {
            return null;
        }
        return queryResults.data.attributes.filter(attribute => attribute.extensionId === name);

    }, [name, queryResults.data]);


    return (
        <>
            <Nf2tHeader to="/extensionLookup" />
            <p>The {extension?.name} was found when processing. <NarReaderBackLink /></p>

            <h4>Nar Extension Information</h4>

            <TableContainer component={Paper}>
                <Table>
                    <TableBody>
                        <TableRow>
                            <TableCell>name</TableCell>
                            <TableCell>{extension?.name}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>type</TableCell>
                            <TableCell>{extension?.type}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>description</TableCell>
                            <TableCell>{extension?.description}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>Nar</TableCell>
                            <TableCell>
                                <Link search={{ name: extension?.narId }} to="/narLookup"><MuiLink component="span">{extension?.narId}</MuiLink></Link>
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>Tags</TableCell>
                            <TableCell><ExtensionTagCell tags={extension?.tags} /></TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </TableContainer>
            <ExtensionAttributeTable title="writesAttributes" type="writes" extension={extension} attributes={attributes} />
            <ExtensionAttributeTable title="readsAttributes" type="reads" extension={extension} attributes={attributes} />

            {extension?.properties && (
                <>
                    <h4>Properties</h4>
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Display Name</TableCell>
                                    <TableCell>Internal Name</TableCell>
                                    <TableCell>Description</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {extension.properties.map((property, index) => (
                                    <TableRow key={index}>
                                        <TableCell>{property.displayName}</TableCell>
                                        <TableCell>{property.name}</TableCell>
                                        <TableCell>{property.description}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </>
            )}

            {extension?.relationships && (
                <>
                    <h4>Relationships</h4>
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Relationship</TableCell>
                                    <TableCell>Description</TableCell>
                                </TableRow>

                            </TableHead>
                            <TableBody>
                                {extension.relationships.map((relationship, index) => (
                                    <TableRow key={index}>
                                        <TableCell>{relationship.name}</TableCell>
                                        <TableCell>{relationship.description}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </>
            )}
        </>
    )
}