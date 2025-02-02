import { createRoute } from "@tanstack/react-router";
import routeTree from "../rootRoute";
import { downloadMavenSearchParamsSchema, DownloadMavenSearchParams } from "./searchParams";

export const downloadMavenRoute = createRoute({
    path: "/mavenCoordinate",
    validateSearch: (search: DownloadMavenSearchParams) => {
        return downloadMavenSearchParamsSchema.parse(search);
    },
    getParentRoute: () => routeTree,
}).lazy(() => import('./mavenCoordinate.lazy').then((d) => d.DownloadMavenRoute));