import { createRoute } from "@tanstack/react-router";
import routeTree from "../rootRoute.tsx";

export const route = createRoute({
    path: "/tagList",
    getParentRoute: () => routeTree,
}).lazy(() => import('./tagList.lazy.tsx').then((d) => d.Route));