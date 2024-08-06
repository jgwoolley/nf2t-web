import { createRoute } from "@tanstack/react-router";
import routeTree from "../rootRoute.tsx";
import { searchParamsSchema } from "./searchParams.ts";

export const route = createRoute({
    path: "/attributeLookup",
    getParentRoute: () => routeTree,
    validateSearch: (search: Record<string, unknown>) => {
        return searchParamsSchema.parse(search);
    },
}).lazy(() => import('./attributeLookup.lazy').then((d) => d.Route));