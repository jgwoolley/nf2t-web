import { ChangeEvent, useMemo } from "react"
import { useNf2tSnackbar } from "../../components/Nf2tSnackbar";
import readNars from "../../utils/readNars";
import { Button, Table, TableBody, TableCell, TableRow, TextField } from "@mui/material";
import Nf2tLinearProgress, { useNf2tLinearProgress } from "../../components/Nf2tLinearProgress";
import Nf2tHeader from "../../components/Nf2tHeader";
import { useNf2tContext } from "../../components/Nf2tContextProvider";
import { Link, createLazyRoute } from "@tanstack/react-router";
import Spacing from "../../components/Spacing";

export const Route = createLazyRoute("/narReader")({
    component: NarReader,
})

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
            snackbarProps.submitSnackbarError("No context provided")
            return;
        }
        if (files == undefined) {
            snackbarProps.submitSnackbarError("Please Provide at Least One File")
            progressBar.updateCurrent(undefined, undefined);
        } else {
            const results = await readNars(files, progressBar.updateCurrent);
            if (results) {
                context.setNars(results);
            }
            progressBar.updateCurrent(files.length, files.length);
        }
    }

    if (context == undefined) {
        return null;
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

            <h5>Attribute Names</h5>
            <Table>
                <TableBody>
                    {sortedAttributes.map(([attributeName, attributeValues], index) => (
                        <TableRow key={index}>
                            <TableCell>
                                <Link to="/attributesLookup" search={{ name: attributeName }}>
                                    {attributeName}
                                </Link>
                            </TableCell>
                            <TableCell>{attributeValues.length}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            <h5>Debug</h5>
            <Table>
                <TableBody>
                    <TableRow>
                        <TableCell>Nars length</TableCell>
                        <TableCell>{Object.keys(context.nars).length}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>Attributes length</TableCell>
                        <TableCell>{sortedAttributes.length}</TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </>
    )
}