import { createRoute } from "@tanstack/react-router";
import routeTree from "../rootRoute";

export const Nf2tCliRoute = createRoute({
    path: "/nf2tcli",
    getParentRoute: () => routeTree,
}).lazy(() => import('./nf2tcli.lazy').then((d) => d.Route));