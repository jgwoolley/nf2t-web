import { createRoute } from "@tanstack/react-router";
import routeTree from "./rootRoute.tsx";

export const route = createRoute({
    path: "/",
    getParentRoute: () => routeTree,
}).lazy(() => import('./home.lazy.tsx').then((d) => d.Route));