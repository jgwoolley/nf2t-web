import { createRoute } from "@tanstack/react-router";
import routeTree from "./rootRoute.tsx";

export const route = createRoute({
    path: "/settings",
    getParentRoute: () => routeTree,
}).lazy(() => import('./settings.lazy.tsx').then((d) => d.Route));