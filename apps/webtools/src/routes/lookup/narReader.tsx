import { createRoute } from "@tanstack/react-router";
import routeTree from "../rootRoute.tsx";

export const route = createRoute({
    path: "/narReader",
    getParentRoute: () => routeTree,
}).lazy(() => import('./narReader.lazy.tsx').then((d) => d.Route));