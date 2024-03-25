
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
  
  export interface InputRouteDescription {
    source?: keyof typeof sourceReferences,
    name: string,
    shortName?: string,
    shortDescription: string,
    description?: string,
  }
  
  export type HasPath = {
    path: string,
  }
  
  export interface RouteDescription {
    route: HasPath,
    source?: SourceReference,
    name: string,
    shortName?: string,
    shortDescription: string,
    description?: string,
  }
  
  export function createRouteDescription(route: HasPath, description: InputRouteDescription) {
    return {
      ...description,
      source: description.source ? sourceReferences[description.source]: undefined,
      route: route,
    }
  }