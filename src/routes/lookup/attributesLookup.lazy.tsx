import { useNf2tContext } from "../../components/Nf2tContextProvider";
import { useMemo } from "react";
import { Table, TableBody, TableCell, TableHead, TableRow } from "@mui/material";
import { Link, createLazyRoute, getRouteApi } from "@tanstack/react-router";
import Nf2tHeader from "../../components/Nf2tHeader";
import { lookupNarAttribute } from "../../utils/readNars";
import ExternalLink from "../../components/ExternalLink";

const route = getRouteApi("/attributesLookup");

export const Route = createLazyRoute("/attributesLookup")({
    component: LookupAttribute,
})

export const coreAttributes = new Map<string, string>([
    ["path", "The FlowFile's path indicates the relative directory to which a FlowFile belongs and does not contain the filename."],
    ["absolute.path","The FlowFile's absolute path indicates the absolute directory to which a FlowFile belongs and does not contain the filename."],
    ["filename","The filename of the FlowFile. The filename should not contain any directory structure."],
    ["uuid","A unique UUID assigned to this FlowFile."],
    ["priority","A numeric value indicating the FlowFile priority."],
    ["mime.type","The MIME Type of this FlowFile."],
    ["discard.reason","Specifies the reason that a FlowFile is being discarded."],
    ["alternate.identifier","Indicates an identifier other than the FlowFile's UUID that is known to refer to this FlowFile."],
]);

export const nf2tAttributes = new Map<string, string>([
    ["filename", "Incoming filename from uploaded file, determined by browser."],
    ["mime.type", "Incoming mime.type from uploaded file, determined by browser."],
    ["lastModified", "Incoming lastModified from uploaded file, determined by browser."],
    ["size", "Incoming size from uploaded file, determined by browser."],
    ["SHA-256", "Calculated by Nf2t."],
]);

export default function LookupAttribute() {
    const { name } = route.useSearch();
    const { nars, attributes } = useNf2tContext();
    const attributeResults = useMemo(() => {
        //TODO: Lookup coreAttributes and Nf2t values
        return attributes.get(name) || [];
    }, [name, attributes]);

    return (
        <>
            <Nf2tHeader to="/attributesLookup" />

            {nf2tAttributes.get(name) && (
                <>
                    <h5>Attributes from Nf2t Tool</h5>
                    <Table>
                        <TableBody>
                            <TableCell>{name}</TableCell>
                            <TableCell>{nf2tAttributes.get(name)}</TableCell>
                        </TableBody>
                    </Table>
                </>
            )}
            {coreAttributes.get(name) && (
                 <>
                 <h5>Core Nifi Attributes</h5>
                 <p>See <ExternalLink href="https://github.com/apache/nifi/blob/main/nifi-api/src/main/java/org/apache/nifi/flowfile/attributes/CoreAttributes.java">CoreAttributes.java</ExternalLink>.</p>
                 <Table>
                     <TableBody>
                         <TableCell>{name}</TableCell>
                         <TableCell>{coreAttributes.get(name)}</TableCell>
                     </TableBody>
                 </Table>
             </>
            )}

            <h5>Attributes from Nars</h5>
            {attributeResults ? (
                <>
                    <p>The {name} attribute was found on the following Nifi Processors. <Link to="/narReader">Navigate to other attributes.</Link></p>
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
                            {attributeResults?.map((narAttributeLuv, narAttributeLuvIndex) => {
                                const {nar, extension, type, attribute, } = lookupNarAttribute(nars, narAttributeLuv);

                                return (
                                    <TableRow key={narAttributeLuvIndex}>
                                        <TableCell>
                                            <Link to="/attributeLookup" search={{...narAttributeLuv}}>{nar.name}</Link>
                                        </TableCell>
                                        <TableCell>
                                            <Link to="/narLookup" search={{nar_index: narAttributeLuv.nar_index}}>{nar.name}</Link>
                                        </TableCell>
                                        <TableCell>
                                            <Link to="/extensionLookup" search={{nar_index: narAttributeLuv.nar_index, extension_index: narAttributeLuv.extension_index}}>{extension.name}</Link>
                                        </TableCell>
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