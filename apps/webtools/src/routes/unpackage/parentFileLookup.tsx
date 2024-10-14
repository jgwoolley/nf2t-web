import { createRoute } from "@tanstack/react-router";
import routeTree from "../rootRoute";
import {ParentFileLookupParamsSchema} from "../lookup/searchParams.ts";

export const route = createRoute({
    path: "/parentFile",
    getParentRoute: () => routeTree,
    validateSearch: (params) => ParentFileLookupParamsSchema.parse(params),
}).lazy(() => import('./parentFileLookup.lazy').then((d) => d.Route));