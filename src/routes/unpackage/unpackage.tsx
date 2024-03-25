import { createRoute } from "@tanstack/react-router";
import routeTree from "../rootRoute.tsx";
import { createRouteDescription } from "../createRouteDescription.ts";

export const route = createRoute({
    path: "/unpackage",
    getParentRoute: () => routeTree,
}).lazy(() => import('./unpackage.lazy.tsx').then((d) => d.Route));

export const description =  createRouteDescription(route, {
    source: "FlowFileUnpackagerV3",
    name: "Unpackager",
    shortDescription: "Unpackage a FlowFile's content, and attributes.",
});