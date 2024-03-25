import { createRoute } from "@tanstack/react-router";
import routeTree from "./rootRoute";

export const route = createRoute({
    path: "/source",
    getParentRoute: () => routeTree,
}).lazy(() => import('./source.lazy').then((d) => d.Route));