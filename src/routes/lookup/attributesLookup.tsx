import { createRoute } from "@tanstack/react-router";
import routeTree from "../rootRoute.tsx";
import { z } from "zod";
import { createRouteDescription } from "../createRouteDescription.ts";

export const LookupAttributeSearchParamsSchema = z.object({
    name: z.string(),
})

export const route = createRoute({
    path: "/attributesLookup",
    getParentRoute: () => routeTree,
    validateSearch: (search: Record<string, unknown>) => {
    return LookupAttributeSearchParamsSchema.parse(search);
    },
}).lazy(() => import('./attributesLookup.lazy.tsx').then((d) => d.Route));

export const description = createRouteDescription(route, {
    name: "Attribute Lookup",
    shortDescription: "Review Nifi Processors that either write to or read the attribute.",
});