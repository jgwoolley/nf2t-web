import { ChangeEvent, useEffect, useMemo, useState } from "react"
import { useNf2tSnackbar } from "../../hooks/useNf2tSnackbar";
import { Button, IconButton, Table, TableBody, TableCell, TableHead, TableRow } from "@mui/material";
import Nf2tLinearProgress from "../../components/Nf2tLinearProgress";
import useNf2tLinearProgress from "../../hooks/useNf2tLinearProgress";
import Nf2tHeader from "../../components/Nf2tHeader";
import { Link, createLazyRoute } from "@tanstack/react-router";
import Spacing from "../../components/Spacing";
import { RoutePathType, routeDescriptions } from "../routeDescriptions";
import { convertBytes } from "../../utils/convertBytes";
import { useNf2tContext } from "../../hooks/useNf2tContext";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { FileUploadOutlined } from "@mui/icons-material";
import { useNf2tTable } from "../../hooks/useNf2tTable";
import Nf2tTable from "../../components/Nf2tTable";
import AddIcon from '@mui/icons-material/Add';
import ExternalLink from "../../components/ExternalLink";
import Nf2tSnackbar from "../../components/Nf2tSnackbar";
import ExtensionIcon from '@mui/icons-material/Extension';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import ArchiveIcon from '@mui/icons-material/Archive';

export const Route = createLazyRoute("/narReader")({
    component: NarReader,
})

export interface Nf2tLinkRowProps {
    to: RoutePathType,
    length: number,
}

function Nf2tLinkRowIcon({ to }: Nf2tLinkRowProps) {
    if(to === "/narList") {
        return <ArchiveIcon />
    }
    else if(to === "/extensionList") {
        return <ExtensionIcon />
    }
    else if(to === "/attributeList") {
        return <AddIcon />
    }
    else if(to === "/tagList") {
        return <LocalOfferIcon />
    }

    return <WaterDropIcon />
}


function Nf2tLinkRow({ to, length }: Nf2tLinkRowProps) {
    const props = routeDescriptions[to]

    return (
        <TableRow>
            <TableCell>
                <Nf2tLinkRowIcon to={to} length={length}/>
            </TableCell>
            <TableCell>
                <Link to={to}>{props.name}</Link>
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
            }, {
                onSuccess: (data) => {
                    console.log(data);
                    progressBar.updateCurrent(undefined, undefined);
                    snackbarProps.submitSnackbarMessage("Uploaded All Nar(s)", "success");
                },
                onError: (e) => {
                    progressBar.updateCurrent(undefined, undefined);
                    snackbarProps.submitSnackbarMessage("Failed to Uploaded All Nar(s)", "error", e);
                },
            });

            progressBar.updateCurrent(files.length, files.length);
        }
    }

    useEffect(() => {
        if(navigator?.storage !== undefined) {
            navigator.storage.estimate().then(estimate => setEstimate(estimate));
        }
    }, []);

    const narNameExamples = useQuery({
        queryKey: ["narExamples"],
        queryFn: async () => {
            return fetch("./nars.txt")
                .then(response => response.text())
                .then(text => text.split("\n").filter( x=> x.length > 0));
        },
    });

    const filteredNarNameExamples = useMemo(() => {
        if (!narNameExamples.data) {
            return [];
        }
        if (!context.queryResults.data) {
            return narNameExamples.data;
        }
        const parsedNames = new Set<string>();
        for (const nar of context.queryResults.data.nars) {
            parsedNames.add(nar.name);
        }

        return narNameExamples.data.filter(name => !parsedNames.has(name));

    }, [context.queryResults.data, narNameExamples])

    const tableProps = useNf2tTable({
        childProps: undefined,
        rows: filteredNarNameExamples,
        snackbarProps: snackbarProps,
        columns: [
            {
                columnName: "Nars",
                bodyRow: ({ row }) => <ExternalLink href={`./nars/${row}`}>{row}</ExternalLink>,
                rowToString: (row) => row,
            },
            {
                columnName: "Add",
                bodyRow: ({ row }) => <Button variant="outlined" disabled={context.narsParse.isPending} onClick={async () => {
                    const url =`./nars/${row}`;                    
                    const file = await fetch(url).then(async (response) => {
                        if (!response.ok) {
                            throw response;
                        }
                        const blob = await response.blob()
                        return new File([blob], row);
                    }).catch((e) => {
                        snackbarProps.submitSnackbarMessage("Failed to process Example Nar", "error", e);
                        return null;
                    });

                    if(file == null) {
                        return;
                    }

                    context.narsParse.mutate({
                        queryClient,
                        files: [file],
                        setCurrentProgress: () => {},
                    }, {
                        onSuccess: (data) => {
                            if(data.narErrorCount > 0) {
                                snackbarProps.submitSnackbarMessage("Failed to add Example Nar", "error", data);
                            } else {
                                snackbarProps.submitSnackbarMessage("Added Example Nar", "success", data);
                            }

                        },
                        onError: (e) => {
                            snackbarProps.submitSnackbarMessage("Failed to add Example Nar", "error", e);
                        },
                    });

                }}><AddIcon /></Button>,
                rowToString: (row) => row,
            },
        ],
        canEditColumn: false,
    });

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
            {progressBar.totalProgress !==0 && (
                <>
                    <Spacing />
                    <Nf2tLinearProgress {...progressBar} />
                </>
            )}

            <h5>Results</h5>
            <p>The following links are available with more information.</p>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell></TableCell>
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

            <h5>Download Examples</h5>
            <p>Below are a bunch of example Nars to download. The reason you can't download them all at once is the site freezes really bad.</p>
            <Nf2tTable {...tableProps} />

            <Spacing />

            <h5>Clear provided Nar files.</h5>
            <Button variant="outlined" onClick={() => {
                context.narsDeleteAll.mutate({ queryClient }, {
                    onSuccess: (data) => {
                        console.log(data);
                        progressBar.updateCurrent(undefined, undefined);
                        snackbarProps.submitSnackbarMessage("Deleted All Nar(s)", "success");
                    },
                    onError: (e) => {
                        progressBar.updateCurrent(undefined, undefined);
                        snackbarProps.submitSnackbarMessage("Failed to Deleted All Nar(s)", "error", e);
                    },
                });

            }}>Clear</Button>
            <Spacing />

            {estimate && (
                <>
                    <h5>Storage Usage Estimate</h5>
                    <p>usage: {convertBytes(estimate.usage)}</p>
                    <p>quota: {convertBytes(estimate.quota)} ({estimate.usage && estimate.quota ? Math.round(estimate.usage / estimate.quota * 10000) / 100 : 0}%)</p>
                    <Spacing />
                </>
            )}

            <Nf2tSnackbar {...snackbarProps} />
        </>
    )
}