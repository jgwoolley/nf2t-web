import { ChangeEvent, useMemo, useState } from "react"
import { useNf2tSnackbar } from "../components/Nf2tSnackbar";
import readNars, { NarAttributeType, Nar, NarAttributeLuv, NarExtension } from "../utils/readNars";
import { Table, TableBody, TableCell, TableRow, TextField } from "@mui/material";
import Nf2tLinearProgress, { useNf2tLinearProgress } from "../components/Nf2tLinearProgress";
import Nf2tHeader, { routeDescriptions } from "../components/Nf2tHeader";

function createAttributeLut(attributes: Map<string, NarAttributeLuv[]>, extension: NarExtension, type: NarAttributeType, nar_index: number, extension_index: number) {
    extension[type].forEach((attribute, attribute_index) => {
        if (attribute.name == undefined) {
            return;
        }

        let values = attributes.get(attribute.name);
        if (values == undefined) {
            values = [];
            attributes.set(attribute.name, values);
        }

        values.push({
            nar_index: nar_index,
            extension_index: extension_index,
            attribute_index: attribute_index,
            type: type,
        })
    });
}

export default function NarReader() {
    const snackbarProps = useNf2tSnackbar();
    const progressBar = useNf2tLinearProgress();
    const [nars, setNars] = useState<Nar[]>([]);
    const attributes = useMemo(() => {
        const results = new Map<string, NarAttributeLuv[]>();
        nars.forEach((nar, nar_index) => {
            nar.extensions.forEach((extension, extension_index) => {
                createAttributeLut(results, extension, "readsAttributes", nar_index, extension_index);
                createAttributeLut(results, extension, "writesAttributes", nar_index, extension_index);
            })
        })

        return Array.from(results.entries()).sort((a, b) => b[1].length - a[1].length);

    }, [nars])

    const onUpload = async (e: ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files == undefined) {
            snackbarProps.submitSnackbarError("Please Provide at Least One File")
            progressBar.updateCurrent(undefined, undefined);
        } else {
            const results = await readNars(files, progressBar.updateCurrent);
            if (results) {
                setNars(results);
            }
            progressBar.updateCurrent(files.length, files.length);
        }
    }

    return (
        <>
            <Nf2tHeader {...routeDescriptions.narReader} />

            <TextField inputProps={{ multiple: true }} type="file" onChange={onUpload} />
            <Nf2tLinearProgress {...progressBar} />

            <h4>Debug</h4>
            <Table>
                <TableBody>
                    <TableRow>
                        <TableCell>nars.length</TableCell>
                        <TableCell>{nars.length}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>attributes.length</TableCell>
                        <TableCell>{attributes.length}</TableCell>
                    </TableRow>
                </TableBody>
            </Table>
            <h4>Attribute Names</h4>
            <Table>
                <TableBody>
                    {attributes.map(([attributeName, attributeValues], index) => (
                        <TableRow key={index}>
                            <TableCell>{attributeName}</TableCell>
                            <TableCell>{attributeValues.length}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </>
    )
}