import { createRoute } from "@tanstack/react-router";
import routeTree from "../rootRoute";
import { createRouteDescription } from "../createRouteDescription";

export const route = createRoute({
    path: "/technologiesInfo",
    getParentRoute: () => routeTree,
}).lazy(() => import('./technologiesInfo.lazy').then((d) => d.Route));

export const description = createRouteDescription(route, {
    name: "Technology Table",
    shortDescription: "Lists the technologies utilized in this project.",
});