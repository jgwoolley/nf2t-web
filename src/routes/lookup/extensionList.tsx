import { createRoute } from "@tanstack/react-router";
import routeTree from "../rootRoute.tsx";
import { ExtensionListSearchParamsSchema } from "./searchParams.ts";

export const route = createRoute({
    path: "/extensionList",
    getParentRoute: () => routeTree,
    validateSearch: (search: Record<string, unknown>) => {
        return ExtensionListSearchParamsSchema.parse(search);
    },
}).lazy(() => import('./extensionList.lazy').then((d) => d.Route));