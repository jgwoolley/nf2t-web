import { route as buildInfo } from "./info/buildInfo";
import { route as technologiesInfo } from "./info/technologiesInfo";
import { route as attributesLookup } from "./lookup/attributesLookup";
import { route as attributeLookup } from "./lookup/attributeLookup";
import { route as extensionLookup } from "./lookup/extensionLookup";
import { route as narLookup } from "./lookup/narLookup";
import { route as narReader } from "./lookup/narReader";
import { route as packageFlowFile } from "./package/package";
import { route as unpackageFlowFile } from "./unpackage/unpackage";
import { route as bulkUnpackageFlowFile } from "./unpackage/bulkUnpackage";
import { route as source } from "./source";
import { route as home } from "./home";

export const routeChildren = [
  buildInfo,
  technologiesInfo,
  attributesLookup,
  attributeLookup,
  extensionLookup,
  narLookup,
  narReader,
  packageFlowFile,
  unpackageFlowFile,
  bulkUnpackageFlowFile,
  source,
  home,
]

export const routePaths = routeChildren.map(x => x.path);
export type RoutePathType = typeof routePaths[0];

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

export interface RouteDescription {
  to: RoutePathType,
  source?: SourceReference,
  name: string,
  shortName?: string,
  shortDescription: string,
  description?: string,
}

export const routeDescriptions: Record<RoutePathType, RouteDescription> = {
  "/": {
    to: "/",
    name: "Nifi FlowFile Tools",
    shortName: "Home",
    shortDescription: "Project Home",
    description: "This is a ReactJS web app that will allow you to package and unpackage Apache Nifi FlowFiles. All the processing occurs in the browser locally."
  },
  "/buildInfo": {
    to: "/buildInfo",
    name: "Build Information",
    shortDescription: "Describes how the project is build.",
  },
  "/technologiesInfo": {
    to: "/technologiesInfo",
    name: "Technology Table",
    shortDescription: "Lists the technologies utilized in this project.",
  },
  "/attributesLookup": {
    to: "/attributesLookup",
    name: "Attributes Lookup",
    shortDescription: "Review Nifi Processors that either write to or read the attributes.",
  },
  "/attributeLookup": {
    to: "/attributeLookup",
    name: "Attribute Lookup",
    shortDescription: "Looks up attribute information based on location in Nars.",
  },
  "/extensionLookup": {
    to: "/extensionLookup",
    name: "Extension Lookup",
    shortDescription: "Looks up extension information based on location in Nars.",
  },
  "/narLookup": {
    to: "/narLookup",
    name: "Nar Lookup",
    shortDescription: "Looks up Nar information.",
  },
  "/narReader": {
    to: "/narReader",
    name: "Nar Reader",
    shortDescription: "Reads Nar files for some extra information.",
    description: "Reads Nar files for some extra information that aids in determining where the FlowFile came from.",
  },
  "/package": {
    to: "/package",
    source: FlowFilePackagerV3Reference,
    name: "Packager",
    shortDescription: "Package a file, and its attributes into a FlowFile.",
  },
  "/unpackage": {
    to: "/unpackage",
    source: FlowFileUnpackagerV3Reference,
    name: "Unpackager",
    shortDescription: "Unpackage a FlowFile's content, and attributes.",
  },
  "/unpackageBulk": {
    to: "/unpackageBulk",
    source: FlowFileUnpackagerV3Reference,
    name: "Bulk Unpackager",
    shortDescription: "Unpackage multiple FlowFiles' attributes into a CSV file.",
  },
  "/source": {
    to: "/source",
    source: GithubRepositoryReference,
    name: "Source Information",
    shortName: "Source",
    shortDescription: "Information on source code.",
  },
}