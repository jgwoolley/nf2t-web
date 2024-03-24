import { LookupAttributeRoute } from "../main";
import { useNf2tContext } from "../components/Nf2tContextProvider";
import { useMemo } from "react";
import { lookupNarAttribute } from "../utils/readNars";
import { Table, TableBody, TableCell, TableHead, TableRow } from "@mui/material";
import { Link } from "@tanstack/react-router";
import Nf2tHeader, { routeDescriptions } from "../components/Nf2tHeader";

export default function LookupAttribute() {
    const { name } = LookupAttributeRoute.useSearch();
    const { nars, attributes } = useNf2tContext();
    const results = useMemo(() => {
        return attributes.get(name);
    }, [name, attributes]);

    return (
        <>
            <Nf2tHeader {...routeDescriptions.attributeReader} />

            {results ? (
                <>
                    <p>The {name} attribute was found on the following Nifi Processors. <Link to="/narReader">Navigate to other attributes.</Link></p>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Nar</TableCell>
                                <TableCell>Extension</TableCell>
                                <TableCell>Type</TableCell>
                                <TableCell>Description</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {results?.map(narLuv => {
                                const { nar, extension, type, attribute } = lookupNarAttribute(nars, narLuv);

                                return (
                                    <TableRow>
                                        <TableCell>{nar.name}</TableCell>
                                        <TableCell>{extension.name}</TableCell>
                                        <TableCell>{type}</TableCell>
                                        <TableCell>{attribute.description}</TableCell>
                                    </TableRow>
                                )
                            })}
                        </TableBody>
                    </Table>
                </>
            ) : (
                <p>Did not find attribute "{name}" amoung the already parsed Nifi processors. <Link to="/narReader">Navigate here to parse additional Nars.</Link></p>
            )}
        </>
    )
}