import { useNf2tContext } from "../../components/Nf2tContextProvider";
import { useMemo } from "react";
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import Nf2tHeader from "../../components/Nf2tHeader";
import { Nar } from "../../utils/readNars";
import { Link, createLazyRoute, getRouteApi } from "@tanstack/react-router";
import { convertBytes } from "../../utils/convertBytes";
import { convertDate } from "../../utils/convertDates";

const route = getRouteApi("/narLookup");

export const Route = createLazyRoute("/narLookup")({
    component: LookupNar,
})

export default function LookupNar() {
    const { nar_index } = route.useSearch();
    const { nars } = useNf2tContext();
    const nar = useMemo<Nar | undefined>(() => {
        return nars[nar_index];
    }, [nars]);

    return (
        <>
            <Nf2tHeader to="/narLookup" />
            <p>The {nar?.name} was found when processing. <Link to="/narReader">Navigate here to reprocess the nars</Link>.</p>

            <h4>Nar Information</h4>

            <Table>
                <TableBody>
                    <TableRow>
                        <TableCell>name</TableCell>
                        <TableCell>{nar?.name}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>lastModified</TableCell>
                        <TableCell>{convertDate(nar?.lastModified)}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>size</TableCell>
                        <TableCell>{convertBytes(nar?.size)}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>groupId</TableCell>
                        <TableCell>{nar?.groupId}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>artifactId</TableCell>
                        <TableCell>{nar?.artifactId}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>version</TableCell>
                        <TableCell>{nar?.version}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>buildTag</TableCell>
                        <TableCell>{nar?.buildTag}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>buildTimestamp</TableCell>
                        <TableCell>{nar?.buildTimestamp}</TableCell>
                    </TableRow>
                </TableBody>
            </Table>

            <h4>Nar Extensions</h4>
            <TableContainer component={Paper}>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Extension</TableCell>
                        <TableCell>Description</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {nar?.extensions.map((extension, extension_index) => {
                        return (
                            <TableRow key={extension_index}>
                                <TableCell>
                                    <Link search={{extension_index: extension_index, nar_index: nar_index}} to="/extensionLookup">{extension.name}</Link>
                                </TableCell>
                                <TableCell>{extension.description}</TableCell>
                            </TableRow>
                        )
                    })}
                </TableBody>
            </Table>
            </TableContainer>
        </>
    )
}