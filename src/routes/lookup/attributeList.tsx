import { createRoute } from "@tanstack/react-router";
import routeTree from "../rootRoute.tsx";

export const route = createRoute({
    path: "/attributeList",
    getParentRoute: () => routeTree,
}).lazy(() => import('./attributeList.lazy').then((d) => d.Route));