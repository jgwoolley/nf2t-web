import { createLazyRoute } from "@tanstack/react-router";
import Nf2tHeader from "../../components/Nf2tHeader";
import { Link as MuiLink } from "@mui/material";
import { Link } from "@tanstack/react-router";

export const routeId = "/unpackage" as const;

function Component() {
    return (
    <>
        <Nf2tHeader to={routeId} /> 
        <Link to="/unpackageFlowFileList"><MuiLink component="span">Go here to unpackage FlowFile(s).</MuiLink></Link>
    </>
    );
}

export const Route = createLazyRoute(routeId)({
    component: Component,
})