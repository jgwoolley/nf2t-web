import { createRoute } from "@tanstack/react-router";
import routeTree from "../rootRoute.tsx";
import { LookupExtensionSearchParamsSchema } from "./searchParams.ts";

export const route = createRoute({
    path: "/extensionLookup",
    getParentRoute: () => routeTree,
    validateSearch: (search: Record<string, unknown>) => {
    return LookupExtensionSearchParamsSchema.parse(search);
    },
}).lazy(() => import('./extensionLookup.lazy.tsx').then((d) => d.Route));