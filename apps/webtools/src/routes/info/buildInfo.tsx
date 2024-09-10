import { createRoute } from "@tanstack/react-router";
import routeTree from "../rootRoute";

export const route = createRoute({
    path: "/buildInfo",
    getParentRoute: () => routeTree,
}).lazy(() => import('./buildInfo.lazy').then((d) => d.Route));