import { Tooltip, Typography } from "@mui/material";
import NfftHeader, { routeDescriptions } from "../components/NfftHeader";
import Spacing from "../components/Spacing";
import ExternalLink from "../components/ExternalLink";
import { Link } from "@tanstack/react-router";

export default function NfftHome() {
    return (
        <>
            <NfftHeader {...routeDescriptions.home}/>
            <Typography>
                While Apache Nifi has its <ExternalLink href="https://github.com/apache/nifi/tree/main/nifi-commons/nifi-flowfile-packager">own Java libraries for packaging / unpackaging FlowFiles</ExternalLink>, running a Java application requires installing Java on a user's system. Previously I had build a command line based tool using the Java libraries. However, web applications are far more convienant than having to run an application in command line, so I decided to create a Web Application.
            </Typography>
            <Spacing height="5pt" />
            <Typography>
                It wasn't trivial to port the Apache Nifi libraries from Java to Javascript (the language of the web). One of the most difficult challanges was figuring out how to convert logic that relied on Java's binary representation of numbers, because Javascript represents numbers differently. Parsing files is also pretty different, and took some time to figure out.
            </Typography>
            <Spacing />

            <p>
                {"Next: "}
                <Tooltip title={routeDescriptions.technologyTable.shortDescription}>
                    <Link to="/technologyTable">{routeDescriptions.technologyTable.name}</Link>
                </Tooltip>
            </p>            
        </>
    )
}