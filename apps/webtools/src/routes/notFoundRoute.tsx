import { NotFoundRoute, Link } from '@tanstack/react-router';
import routeTree from "./rootRoute.tsx";
import { Link as MuiLink } from "@mui/material";

export const notFoundRoute = new NotFoundRoute({
    getParentRoute: () => routeTree,
    component: () => <Link to="/"><MuiLink component="span">404 Not Found</MuiLink></Link>,
})

export default notFoundRoute;