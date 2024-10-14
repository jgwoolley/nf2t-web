import { createRoute } from "@tanstack/react-router";
import routeTree from "../rootRoute";
import { UnpackageFlowFilesListSchema } from "../lookup/searchParams.ts";

export const ViewFlowFilesRoute = createRoute({
    path: "/unpackageFlowFileList",
    getParentRoute: () => routeTree,
    validateSearch: (search: Record<string, unknown>) => {
        return UnpackageFlowFilesListSchema.parse(search);
    },
}).lazy(() => import('./unpackageFlowFileList.lazy.tsx').then((d) => d.Route));