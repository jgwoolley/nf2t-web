import { createRoute } from "@tanstack/react-router";
import routeTree from "../rootRoute.tsx";

export const route = createRoute({
    path: "/package",
    getParentRoute: () => routeTree,
}).lazy(() => import('./package.lazy.tsx').then((d) => d.Route));