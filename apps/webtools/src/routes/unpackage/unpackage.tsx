import { createRoute } from "@tanstack/react-router";
import routeTree from "../rootRoute.tsx";
import { UnpackageSearchParamsSchema } from "../lookup/searchParams.ts";

export const route = createRoute({
    path: "/unpackage",
    getParentRoute: () => routeTree,
    validateSearch: (params) => UnpackageSearchParamsSchema.parse(params),
}).lazy(() => import('./unpackage.lazy.tsx').then((d) => d.Route));