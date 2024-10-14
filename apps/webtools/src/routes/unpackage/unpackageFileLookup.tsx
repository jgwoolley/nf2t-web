import { createRoute } from "@tanstack/react-router";
import routeTree from "../rootRoute";
import {ParentFileLookupParamsSchema} from "../lookup/searchParams.ts";

export const UnpackageFileLookupRoute = createRoute({
    path: "/unpackageFileLookup",
    getParentRoute: () => routeTree,
    validateSearch: (params) => ParentFileLookupParamsSchema.parse(params),
}).lazy(() => import('./unpackageFileLookup.lazy.tsx').then((d) => d.Route));