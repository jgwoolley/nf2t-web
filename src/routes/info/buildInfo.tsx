import { createRoute } from "@tanstack/react-router";
import routeTree from "../rootRoute";
import { createRouteDescription } from "../createRouteDescription";

export const route = createRoute({
    path: "/buildInfo",
    getParentRoute: () => routeTree,
}).lazy(() => import('./buildInfo.lazy').then((d) => d.Route));

export const description = createRouteDescription(route, {
    name: "Build Information",
    shortDescription: "Describes how the project is build.",
});