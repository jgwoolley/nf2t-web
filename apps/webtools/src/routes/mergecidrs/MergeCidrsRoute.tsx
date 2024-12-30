import { createRoute } from "@tanstack/react-router";
import routeTree from "../rootRoute.tsx";

export const MergeCidrsRoute = createRoute({
    path: "/mergecidrs",
    getParentRoute: () => routeTree,
}).lazy(() => import('./MergeCidrsRoute.lazy.tsx').then((d) => d.Route));