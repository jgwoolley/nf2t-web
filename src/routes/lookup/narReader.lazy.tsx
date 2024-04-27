import { ChangeEvent, useMemo } from "react"
import { useNf2tSnackbar } from "../../components/Nf2tSnackbar";
import readNars from "../../utils/readNars";
import { Button, Table, TableBody, TableCell, TableHead, TableRow, TextField } from "@mui/material";
import Nf2tLinearProgress, { useNf2tLinearProgress } from "../../components/Nf2tLinearProgress";
import Nf2tHeader from "../../components/Nf2tHeader";
import { useNf2tContext } from "../../components/Nf2tContextProvider";
import { Link, createLazyRoute } from "@tanstack/react-router";
import Spacing from "../../components/Spacing";
import { RoutePathType, routeDescriptions } from "../routeDescriptions";

export const Route = createLazyRoute("/narReader")({
    component: NarReader,
})

export interface Nf2tLinkRowProps {
    to: RoutePathType,
    length: number,
}

function Nf2tLinkRow({to, length}: Nf2tLinkRowProps) {
    const props = routeDescriptions[to]

    return (
        <TableRow>
            <TableCell>
                <Link to={to}>
                    {props.name}
                </Link>
            </TableCell>
            <TableCell>
                {props.shortDescription}
            </TableCell>
            <TableCell>
                {length}
            </TableCell>
        </TableRow>

    )
}

export default function NarReader() {
    const snackbarProps = useNf2tSnackbar();
    const progressBar = useNf2tLinearProgress();
    const context = useNf2tContext();

    const sortedAttributes = useMemo(() => {
        return Array.from(context.attributes.entries()).sort((a, b) => b[1].length - a[1].length);
    }, [context.attributes]);

    const onUpload = async (e: ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (context == undefined) {
            snackbarProps.submitSnackbarMessage("No context provided.", "error")
            return;
        }
        if (files == undefined) {
            snackbarProps.submitSnackbarMessage("Please Provide at Least One File.", "error")
            progressBar.updateCurrent(undefined, undefined);
        } else {
            const results = await readNars(files, progressBar.updateCurrent);
            if (results) {
                context.setNars(results);
            }
            progressBar.updateCurrent(files.length, files.length);
        }
    }

    return (
        <>
            <Nf2tHeader to="/narReader" />

            <h5>Provide Nars</h5>
            {context.attributes.size <= 0 ? (
                <>
                    <p>Provide multiple Nar files.</p>
                    <TextField inputProps={{ multiple: true }} type="file" onChange={onUpload} />
                </>
            ) : (
                <>
                    <p>Clear provided Nar files.</p>
                    <Button onClick={() => {
                        context.setNars([]);
                        progressBar.updateCurrent(undefined, undefined);
                    }}>Clear</Button>
                </>

            )}

            <Spacing />
            <Nf2tLinearProgress {...progressBar} />

            <h5>Results</h5>
            <p>The following links are available with more information.</p>
            <Table>
                <TableHead>
                    <TableRow>
                    <TableCell>Results</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Length</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    <Nf2tLinkRow to="/narList" length={Object.keys(context.nars).length}/>
                    <Nf2tLinkRow to="/attributeList" length={sortedAttributes.length} />
                </TableBody>
            </Table>
            <Spacing />
        </>
    )
}