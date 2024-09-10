import { createRoute } from "@tanstack/react-router";
import routeTree from "../rootRoute";

export const route = createRoute({
    path: "/technologiesInfo",
    getParentRoute: () => routeTree,
}).lazy(() => import('./technologiesInfo.lazy').then((d) => d.Route));