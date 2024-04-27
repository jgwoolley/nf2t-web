import { Typography } from "@mui/material";
import Nf2tHeader from "../components/Nf2tHeader";
import Spacing from "../components/Spacing";
import ExternalLink from "../components/ExternalLink";
import PrevNext from "../components/PrevNext";
import { Link, createLazyRoute } from "@tanstack/react-router";
import { routeDescriptions, RoutePathType } from "./routeDescriptions";
import Nf2tTable, { useNf2tTable } from "../components/Nf2tTable";
import { useNf2tSnackbar } from "../components/Nf2tSnackbar";

export const Route = createLazyRoute("/")({
    component: Nf2tHome,
})

const linkStyles: React.CSSProperties = {
    color: "inherit",
    textDecoration: "inherit",
}

export default function Nf2tHome() {
    const snackbarProps = useNf2tSnackbar();

    const tableProps = useNf2tTable<RoutePathType, undefined>({
        childProps: undefined,
        canEditColumn: false,
        snackbarProps: snackbarProps,
        columns: [
            { 
                columnName: "Tool", 
                compareFn: (a, b) => routeDescriptions[b].name.localeCompare(routeDescriptions[a].name),
                bodyRow: ({row}) => <Link style={linkStyles} to={routeDescriptions[row].to}>{routeDescriptions[row].name}</Link>,
                rowToString: (row) => routeDescriptions[row].name,
            },
            { 
                columnName: "Description", 
                compareFn: (a, b) => (routeDescriptions[b].shortDescription || "").localeCompare((routeDescriptions[a].shortDescription || "")),
                bodyRow: ({row}) => routeDescriptions[row].shortDescription,
                rowToString: (row) => routeDescriptions[row].shortDescription || "",
            },
        ],
        rows: [
            "/unpackageBulk",
            "/package",
            "/narReader",
            "/source",
        ],
    });

    return (
        <>
            <Nf2tHeader to="/" />
            <Typography>
                While Apache Nifi has its <ExternalLink href="https://github.com/apache/nifi/tree/main/nifi-commons/nifi-flowfile-packager">own Java libraries for packaging / unpackaging FlowFiles</ExternalLink>, running a Java application requires installing Java on a user's system. Previously I had built a command line based tool using the Java libraries. However, web applications are far more convienant than having to run an application in command line, so I decided to create a Web Application.
            </Typography>
            <Spacing height="5pt" />
            <Typography>
                It wasn't trivial to port the Apache Nifi libraries from Java to Javascript (the language of the web). One of the most difficult challanges was figuring out how to convert logic that relied on Java's binary representation of numbers, because Javascript represents numbers differently. Parsing files is also pretty different, and took some time to figure out.
            </Typography>
            <Spacing />
            <Typography variant="h6" component="h6">
                Available Tools
            </Typography>
            <Spacing />
            <Nf2tTable {...tableProps} />
            <Spacing />
            <PrevNext next="/technologiesInfo" />
        </>
    )
}