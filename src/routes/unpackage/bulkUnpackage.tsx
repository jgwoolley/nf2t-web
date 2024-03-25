import { createRoute } from "@tanstack/react-router";
import routeTree from "../rootRoute";
import { createRouteDescription } from "../createRouteDescription";

export const route = createRoute({
    path: "/unpackageBulk",
    getParentRoute: () => routeTree,
}).lazy(() => import('./bulkUnpackage.lazy').then((d) => d.Route));

export const description =  createRouteDescription(route, {
    source: "FlowFileUnpackagerV3",
    name: "Bulk Unpackager",
    shortDescription: "Unpackage multiple FlowFiles' attributes into a CSV file.",
});