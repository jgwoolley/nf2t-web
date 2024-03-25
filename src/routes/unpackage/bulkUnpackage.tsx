import { createRoute } from "@tanstack/react-router";
import routeTree from "../rootRoute";

export const route = createRoute({
    path: "/unpackageBulk",
    getParentRoute: () => routeTree,
}).lazy(() => import('./bulkUnpackage.lazy').then((d) => d.Route));