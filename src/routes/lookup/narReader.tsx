import { createRoute } from "@tanstack/react-router";
import routeTree from "../rootRoute.tsx";
import { createRouteDescription } from "../createRouteDescription.ts";

export const route = createRoute({
    path: "/narReader",
    getParentRoute: () => routeTree,
}).lazy(() => import('./narReader.lazy.tsx').then((d) => d.Route));

export const description = createRouteDescription(route, {
    name: "Nar Reader",
    shortDescription: "Parse Nars for their data.",
});