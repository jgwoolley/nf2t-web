import { createRoute } from "@tanstack/react-router";
import routeTree from "../rootRoute.tsx";

export const PdfCombinerRoute = createRoute({
    path: "/pdfcombiner",
    getParentRoute: () => routeTree,
}).lazy(() => import('./PdfCombinerRoute.lazy.tsx').then((d) => d.Route));