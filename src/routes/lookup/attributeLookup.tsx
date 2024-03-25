import { createRoute } from "@tanstack/react-router";
import routeTree from "../rootRoute.tsx";
import { z } from "zod";

export const searchParamsSchema = z.object({
    nar_index: z.number(),
    extension_index: z.number(),
    type: z.enum(["writesAttributes", "readsAttributes"]),
    attribute_index: z.number(),
})

export const route = createRoute({
    path: "/attributeLookup",
    getParentRoute: () => routeTree,
    validateSearch: (search: Record<string, unknown>) => {
        return searchParamsSchema.parse(search);
    },
}).lazy(() => import('./attributeLookup.lazy').then((d) => d.Route));