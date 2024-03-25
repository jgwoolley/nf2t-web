import { createRoute } from "@tanstack/react-router";
import routeTree from "../rootRoute.tsx";
import { z } from "zod";
import { createRouteDescription } from "../createRouteDescription.ts";

export const LookupNarSearchParamsSchema = z.object({
    nar_index: z.number(),
});

export const route = createRoute({
    path: "/narLookup",
    getParentRoute: () => routeTree,
    validateSearch: (search: Record<string, unknown>) => {
        return LookupNarSearchParamsSchema.parse(search);
    },
}).lazy(() => import('./narLookup.lazy.tsx').then((d) => d.Route));

export const description = createRouteDescription(route, {
    name: "Nar Lookup",
    shortDescription: "",
});
