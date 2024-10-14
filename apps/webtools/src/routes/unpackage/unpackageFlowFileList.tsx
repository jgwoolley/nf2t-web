import { createRoute } from "@tanstack/react-router";
import routeTree from "../rootRoute";

export const ViewFlowFilesRoute = createRoute({
    path: "/unpackageFlowFileList",
    getParentRoute: () => routeTree,
}).lazy(() => import('./unpackageFlowFileList.lazy.tsx').then((d) => d.Route));