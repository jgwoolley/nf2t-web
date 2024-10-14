import { createRoute } from "@tanstack/react-router";
import routeTree from "../rootRoute.tsx";
import { UnpackageSearchParamsSchema } from "../lookup/searchParams.ts";

export const ViewFlowFileRoute = createRoute({
    path: "/unpackageFlowFileLookup",
    getParentRoute: () => routeTree,
    validateSearch: (params) => UnpackageSearchParamsSchema.parse(params),
}).lazy(() => import('./unpackageFlowFileLookup.lazy.tsx').then((d) => d.Route));