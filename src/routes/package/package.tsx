import { createRoute } from "@tanstack/react-router";
import routeTree from "../rootRoute.tsx";
import { createRouteDescription } from "../createRouteDescription.ts";

export const route = createRoute({
    path: "/package",
    getParentRoute: () => routeTree,
}).lazy(() => import('./package.lazy.tsx').then((d) => d.Route));

export const description =  createRouteDescription(route, {
    source: "FlowFilePackagerV3",
    name: "Packager",
    shortDescription: "Package a file, and its attributes into a FlowFile.",
});