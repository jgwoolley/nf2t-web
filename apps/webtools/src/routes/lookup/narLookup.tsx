import { createRoute } from "@tanstack/react-router";
import routeTree from "../rootRoute.tsx";
import { LookupNarSearchParamsSchema } from "./searchParams.ts";

export const route = createRoute({
    path: "/narLookup",
    getParentRoute: () => routeTree,
    validateSearch: (search: Record<string, unknown>) => {
        return LookupNarSearchParamsSchema.parse(search);
    },
}).lazy(() => import('./narLookup.lazy.tsx').then((d) => d.Route));