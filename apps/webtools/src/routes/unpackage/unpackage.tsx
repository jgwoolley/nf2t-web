import { createRoute } from "@tanstack/react-router";
import routeTree from "../rootRoute.tsx";

export const route = createRoute({
    path: "/unpackage",
    getParentRoute: () => routeTree,
}).lazy(() => import('./unpackage.lazy.tsx').then((d) => d.Route));