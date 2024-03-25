import { createRoute } from "@tanstack/react-router";
import routeTree from "./rootRoute";
import { createRouteDescription } from "./createRouteDescription";

export const route = createRoute({
    path: "/source",
    getParentRoute: () => routeTree,
}).lazy(() => import('./source.lazy').then((d) => d.Route));

export const description = createRouteDescription(route, {
    source: "GithubRepository",
    name: "Source Information",
    shortName: "Source",
    shortDescription: "Information on source code.",
});