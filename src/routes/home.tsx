import { createRoute } from "@tanstack/react-router";
import routeTree from "./rootRoute.tsx";
import { createRouteDescription } from "./createRouteDescription.ts";

export const route = createRoute({
    path: "/",
    getParentRoute: () => routeTree,
}).lazy(() => import('./home.lazy.tsx').then((d) => d.Route));

export const description = createRouteDescription(route, {
    name: "Nifi FlowFile Tools",
    shortName: "Home",
    shortDescription: "Project Home",
    description: "This is a ReactJS web app that will allow you to package and unpackage Apache Nifi FlowFiles. All the processing occurs in the browser locally."
});