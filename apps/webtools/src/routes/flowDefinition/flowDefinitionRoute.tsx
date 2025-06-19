import { createRoute } from "@tanstack/react-router";
import routeTree from "../rootRoute.tsx";

export const flowDefinitionRoute = createRoute({
    path: "/flowDefinition",
    getParentRoute: () => routeTree,
}).lazy(() => import('./flowDefinitionRoute.lazy.tsx').then((d) => d.Route));