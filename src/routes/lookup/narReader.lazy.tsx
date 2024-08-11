import { ChangeEvent, useEffect, useState } from "react"
import { useNf2tSnackbar } from "../../components/Nf2tSnackbar";
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
import ExternalLink from "../../components/ExternalLink";

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

    const isEmpty = (narsLength + extensionsLength + attributesLength) <= 0;

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

            {isEmpty ? (
                <>
                    <h6>Download example Nar file(s)</h6>
                    <p>An example NAR file is located here: <ExternalLink href={"https://mvnrepository.com/artifact/org.apache.nifi/nifi-standard-services-api-nar"}>nifi-standard-services-api-nar</ExternalLink>.</p>
                    
                    {/* 
                    <Button variant="outlined" onClick={() => {
                        const url = "https://repo1.maven.org/maven2/org/apache/nifi/nifi-standard-services-api-nar/1.27.0/nifi-standard-services-api-nar-1.27.0.nar";
                        //TODO: Update implementation of processNars to consume File[] rather than a FileList
                        fetch(url).then(async x => {
                            const file = new File([await x.blob()], x.url.split("/")?.at(-1) || "test");
                            const files = [file];
                            console.log(files);
                        });
                    }}>Download</Button>                     */}
                </>
            ): (
                <>
                    <h6>Clear provided Nar files.</h6>
                    <Button variant="outlined" onClick={() => {
                        context.narsDeleteAll.mutate({ queryClient });
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
                    <Nf2tLinkRow to="/narList" length={narsLength} />
                    <Nf2tLinkRow to="/attributeList" length={attributesLength} />
                    <Nf2tLinkRow to="/extensionList" length={extensionsLength} />
                </TableBody>
            </Table>
            <Spacing />
        </>
    )
}