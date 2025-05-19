import { createRoute } from "@tanstack/react-router";
import routeTree from "../rootRoute";

export const mavenCoordinateResolverRoute = createRoute({
    path: "/mavenCoordinateResolver",
    getParentRoute: () => routeTree,
}).lazy(() => import('./mavenCoordinateResolver.lazy').then((d) => d.MavenCoordinateResolverRoute));