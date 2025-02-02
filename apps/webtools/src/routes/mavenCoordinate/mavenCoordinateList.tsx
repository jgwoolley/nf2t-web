import { createRoute } from "@tanstack/react-router";
import routeTree from "../rootRoute";

export const mavenCoordinateListRoute = createRoute({
    path: "/mavenCoordinateList",
    getParentRoute: () => routeTree,
}).lazy(() => import('./mavenCoordinateList.lazy').then((d) => d.MavenCoordinateListRoute));