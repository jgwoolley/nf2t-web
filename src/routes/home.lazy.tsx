import { Table, TableBody, TableCell, TableHead, TableRow, Typography } from "@mui/material";
import Nf2tHeader from "../components/Nf2tHeader";
import Spacing from "../components/Spacing";
import ExternalLink from "../components/ExternalLink";
import PrevNext from "../components/PrevNext";
import { Link, createLazyRoute } from "@tanstack/react-router";
import { RouteDescription } from "./createRouteDescription";
import { description as homeDescription } from "./home";
import { description as sourceDescription } from "./source";
import { description as technologiesInfoDescription } from "./info/technologiesInfo";
import { description as unpackageDescription } from "./unpackage/unpackage";
import { description as bulkUnpackageDescription } from "./unpackage/bulkUnpackage";
import { description as packageDescription } from "./package/package";

sourceDescription

export const Route = createLazyRoute("/")({
    component: Nf2tHome,
})

const linkStyles: React.CSSProperties = {
    color: "inherit",
    textDecoration: "inherit",
}

function ToolRow({ route }: { route: RouteDescription }) {
    return (

        <TableRow>
            <TableCell><Link style={linkStyles} to={route.route.path}>
                {route.name}
            </Link></TableCell>
            <TableCell>{route.shortDescription}</TableCell>
        </TableRow>
    )
}

export default function Nf2tHome() {
    return (
        <>
            <Nf2tHeader {...homeDescription} />
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
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Tool</TableCell>
                        <TableCell>Description</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    <ToolRow route={unpackageDescription} />
                    <ToolRow route={bulkUnpackageDescription} />
                    <ToolRow route={packageDescription} />
                    <ToolRow route={sourceDescription} />
                </TableBody>
            </Table>

            <Spacing />
            <PrevNext next={technologiesInfoDescription} />
        </>
    )
}