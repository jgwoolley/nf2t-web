import { createRoute } from "@tanstack/react-router";
import routeTree from "../rootRoute.tsx";
import { z } from "zod";
import { createRouteDescription } from "../createRouteDescription.ts";

export const LookupExtensionSearchParamsSchema = z.object({
    nar_index: z.number(),
    extension_index: z.number(),
});

export const route = createRoute({
    path: "/extensionLookup",
    getParentRoute: () => routeTree,
    validateSearch: (search: Record<string, unknown>) => {
    return LookupExtensionSearchParamsSchema.parse(search);
    },
}).lazy(() => import('./extensionLookup.lazy.tsx').then((d) => d.Route));

export const description =  createRouteDescription(route, {
    name: "Extension Lookup",
    shortDescription: "",
});