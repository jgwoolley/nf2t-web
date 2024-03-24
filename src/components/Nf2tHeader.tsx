import { Typography } from "@mui/material";
import { useEffect, useMemo } from "react";
import ExternalLink from "./ExternalLink";

export type SourceReference = {
    url: string,
    name: string,
    prefix: string,
}

const FlowFileUnpackagerV3Reference: SourceReference = {
    url: "https://github.com/apache/nifi/blob/main/nifi-commons/nifi-flowfile-packager/src/main/java/org/apache/nifi/util/FlowFileUnpackagerV3.java",
    name: "FlowFileUnpackagerV3.java",
    prefix: "Javascript Port of ",
}

const FlowFilePackagerV3Reference: SourceReference = {
    url: "https://github.com/apache/nifi/blob/main/nifi-commons/nifi-flowfile-packager/src/main/java/org/apache/nifi/util/FlowFilePackagerV3.java",
    name: "FlowFilePackagerV3.java",
    prefix: "Javascript Port of ",
}

const GithubRepositoryReference = {
    url: "https://github.com/jgwoolley/Nifi-Flow-File-Helper",
    name: "https://github.com/jgwoolley/Nifi-Flow-File-Helper",
    prefix: "The source code of this project is stored at ",
}

export const sourceReferences = {
    FlowFileUnpackagerV3: FlowFileUnpackagerV3Reference,
    FlowFilePackagerV3: FlowFilePackagerV3Reference,
    GithubRepository: GithubRepositoryReference,
}

export type RouteDescription = {
    to: "/" | "/source" | "/technologyTable" | "/buildProcess" | "/package" | "/bulkUnpackage" | "/unpackage" | "/narReader" | "/lookupAttribute",
    source?: SourceReference,
    name: string,
    shortName?: string,
    shortDescription: string,
    description?: string,
}

const unpackageDescription: RouteDescription = {
    to: "/unpackage",
    source: sourceReferences.FlowFileUnpackagerV3,
    name: "Unpackager",
    shortDescription: "Unpackage a FlowFile's content, and attributes.",
}

const bulkUnpackageDescription: RouteDescription = {
    to: "/bulkUnpackage",
    source: sourceReferences.FlowFileUnpackagerV3,
    name: "Bulk Unpackager",
    shortDescription: "Unpackage multiple FlowFiles' attributes into a CSV file.",
}

const packageDescription: RouteDescription = {
    to: "/package",
    source: sourceReferences.FlowFilePackagerV3,
    name: "Packager",
    shortDescription: "Package a file, and its attributes into a FlowFile.",
}

const sourceDescription: RouteDescription = {
    to: "/source",
    source: sourceReferences.GithubRepository,
    name: "Source Information",
    shortName: "Source",
    shortDescription: "Information on source code.",
}

const homeDescription: RouteDescription = {
    to: "/",
    name: "Nifi FlowFile Tools",
    shortName: "Home",
    shortDescription: "Project Home",
    description: "This is a ReactJS web app that will allow you to package and unpackage Apache Nifi FlowFiles. All the processing occurs in the browser locally."
}

const technologyTableDescription: RouteDescription = {
    to: "/technologyTable",
    name: "Technology Table",
    shortDescription: "Lists the technologies utilized in this project.",
}

const buildProcessDescription: RouteDescription = {
    to: "/buildProcess",
    name: "Build Process",
    shortDescription: "Describes how the project is build.",
}

const narReaderDescription: RouteDescription = {
    to: "/narReader",
    name: "Attributes Reader",
    shortDescription: "Parse Nars for their data.",
}

const attributeReaderDescription: RouteDescription = {
    to: "/lookupAttribute",
    name: "Attribute Reader",
    shortDescription: "Review Nifi Processors that either write to or read the attribute.",
}

export const routeDescriptions = {
    unpackage: unpackageDescription,
    bulkUnpackage: bulkUnpackageDescription,
    package: packageDescription,
    source: sourceDescription,
    home: homeDescription,
    technologyTable: technologyTableDescription,
    buildProcess: buildProcessDescription,
    narReader: narReaderDescription,
    attributeReader: attributeReaderDescription,
}

export function useNf2tHeader({name, shortName}: RouteDescription) {
    useEffect(() => {
        document.title = `FlowFile Tools - ${shortName || name}`;
    }, [shortName, name])

    const headerTitle = useMemo(() => `FlowFile Tools - ${name}`, [name]);

    return headerTitle;
}

export default function Nf2tHeader(props: RouteDescription) {
    const title = useNf2tHeader(props);

    return (
        <>
            <Typography variant="h5" component="h5">
                { title }
            </Typography>
            <p>{props.description || props.shortDescription}</p>
            {props.source && (
                <p>{props.source.prefix} <ExternalLink href={props.source.url}>{props.source.name}</ExternalLink>.</p>
            )}
        </>
    )
}