import { createRoute } from "@tanstack/react-router";
import routeTree from "../rootRoute.tsx";

export const route = createRoute({
    path: "/narList",
    getParentRoute: () => routeTree,
}).lazy(() => import('./narList.lazy.tsx').then((d) => d.Route));