import { createRoute } from "@tanstack/react-router";
import routeTree from "../rootRoute.tsx";

export const route = createRoute({
    path: "/extensionList",
    getParentRoute: () => routeTree,
}).lazy(() => import('./extensionList.lazy').then((d) => d.Route));