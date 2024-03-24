import { LookupExtensionRoute } from "../main";
import { useNf2tContext } from "../components/Nf2tContextProvider";
import { useMemo } from "react";
import { Table, TableBody, TableCell, TableHead, TableRow } from "@mui/material";
import Nf2tHeader, { routeDescriptions } from "../components/Nf2tHeader";
import { Nar, NarAttributeType, NarExtension } from "../utils/readNars";
import { Link } from "@tanstack/react-router";

interface ExtensionAttributeTableProps {
    extension?: NarExtension,
    type: NarAttributeType,
    title: string,
}

function ExtensionAttributeTable({ extension, type, title, }: ExtensionAttributeTableProps) {
    if (extension == undefined) {
        return null;
    }

    const values = extension[type];
    if(values.length <= 0) {
        return;
    }

    return (
        <>
            <h3>{title}</h3>

            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Extension</TableCell>
                        <TableCell>Description</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {values.map((attribute, attribute_index) => (
                        <TableRow key={attribute_index}>
                            <TableCell>
                                <Link search={{ name: attribute.name }} to="/lookupAttribute">{attribute.name}</Link>
                            </TableCell>
                            <TableCell>{attribute.description}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </>
    )
}

interface LookupExtensionMemo {
    extension: NarExtension,
    nar: Nar,
}

export default function LookupExtension() {
    const { nar_index, extension_index } = LookupExtensionRoute.useSearch();
    const { nars } = useNf2tContext();
    
    const {nar, extension} = useMemo<LookupExtensionMemo>(() => {
        const newNar = nars[nar_index];
        const newExtension = newNar.extensions[extension_index];

        return {
            extension: newExtension,
            nar: newNar,
        }
    }, [nars, nar_index, extension_index]);

    return (
        <>
            <Nf2tHeader {...routeDescriptions.lookupNar} />
            <p>The {extension?.name} was found when processing. <Link to="/narReader">Navigate here to reprocess the nars</Link>.</p>

            <h4>Nar Extension Information</h4>

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
                        <TableCell><Link search={{nar_index: nar_index}} to="/lookupNar">{nar?.name}</Link></TableCell>
                    </TableRow>
                </TableBody>
            </Table>
            <ExtensionAttributeTable title="writesAttributes" type="writesAttributes" extension={extension} />
            <ExtensionAttributeTable title="readsAttributes" type="readsAttributes" extension={extension} />
        </>
    )
}