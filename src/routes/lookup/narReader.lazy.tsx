import { ChangeEvent, useEffect, useState } from "react"
import { useNf2tSnackbar } from "../../hooks/useNf2tSnackbar";
import { Button, IconButton, Table, TableBody, TableCell, TableHead, TableRow } from "@mui/material";
import Nf2tLinearProgress, { useNf2tLinearProgress } from "../../components/Nf2tLinearProgress";
import Nf2tHeader from "../../components/Nf2tHeader";
import { Link, createLazyRoute } from "@tanstack/react-router";
import Spacing from "../../components/Spacing";
import { RoutePathType, routeDescriptions } from "../routeDescriptions";
import { convertBytes } from "../../utils/convertBytes";
import { useNf2tContext } from "../../hooks/useNf2tContext";
import { useQueryClient } from "@tanstack/react-query";
import { FileUploadOutlined } from "@mui/icons-material";

export const Route = createLazyRoute("/narReader")({
    component: NarReader,
})

export interface Nf2tLinkRowProps {
    to: RoutePathType,
    length: number,
}

function Nf2tLinkRow({ to, length }: Nf2tLinkRowProps) {
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
    const queryClient = useQueryClient();
    const snackbarProps = useNf2tSnackbar();
    const progressBar = useNf2tLinearProgress();
    const context = useNf2tContext();
    const [estimate, setEstimate] = useState<StorageEstimate>();

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
            context.narsParse.mutate({
                queryClient,
                files: Array.from(files),
                setCurrentProgress: progressBar.updateCurrent,
            });

            progressBar.updateCurrent(files.length, files.length);
        }
    }

    useEffect(() => {
        navigator.storage.estimate().then(estimate => setEstimate(estimate));
    }, []);

    const narsLength = context.queryResults.data?.nars.length || 0;
    const extensionsLength = context.queryResults.data?.extensions.length || 0;
    const attributesLength = context.queryResults.data?.attributes.length || 0;
    const tagsLength = context.queryResults.data?.tags.length || 0;

    return (
        <>
            <Nf2tHeader to="/narReader" />

            <h5>Provide Nars</h5>

            <h6>Provide multiple Nar files.</h6>

            <IconButton component="label">
                <FileUploadOutlined />
                <input
                    multiple={true}
                    style={{ display: "none" }}
                    type="file"
                    hidden
                    onChange={onUpload}
                    name="[licenseFile]"
                />
            </IconButton>

            {estimate && (
                <>
                    <h6>Storage Usage Estimate</h6>
                    <p>usage: {convertBytes(estimate.usage)}</p>
                    <p>quota: {convertBytes(estimate.quota)} ({estimate.usage && estimate.quota ? Math.round(estimate.usage / estimate.quota * 10000) / 100 : 0}%)</p>
                </>
            )}

            <h6>Download Examples</h6>
            <Button variant="outlined" onClick={async () => {
                const files = await fetch("./nars.txt")
                    .then(response => response.text())
                    .then(async (text) => {
                        const files: File[] = [];
                        const lines = text.split("\n");
                        const length = 5; //lines.length;

                        progressBar.updateCurrent(0, length);
                        for (let index = 0; index < length; index++) {
                            const line = lines[index];
                            progressBar.updateCurrent(index, length);
                            const file = await fetch(`/nars/${line}`).then(async (response) => {
                                const blob = await response.blob()
                                return new File([blob], line);
                            })
                            files.push(file);
                        }
                        return files;
                    }).catch((e) => {
                        snackbarProps.submitSnackbarMessage("Failed to parse examples.", "error", e)
                        const files: File[] = [];
                        return files;
                    });

                if (!files.length) {
                    return;
                }
                context.narsParse.mutate({
                    queryClient,
                    files: files,
                    setCurrentProgress: progressBar.updateCurrent,
                });

                progressBar.updateCurrent(files.length, files.length);
            }}>Download</Button>

            <h6>Clear provided Nar files.</h6>
            <Button variant="outlined" onClick={() => {
                context.narsDeleteAll.mutate({ queryClient });
                progressBar.updateCurrent(undefined, undefined);
            }}>Clear</Button>

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
                    <Nf2tLinkRow to="/narList" length={narsLength} />
                    <Nf2tLinkRow to="/attributeList" length={attributesLength} />
                    <Nf2tLinkRow to="/extensionList" length={extensionsLength} />
                    <Nf2tLinkRow to="/tagList" length={tagsLength} />
                </TableBody>
            </Table>
            <Spacing />
        </>
    )
}