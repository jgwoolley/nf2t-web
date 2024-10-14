
import { Link as MuiLink } from "@mui/material";
import { Link } from "@tanstack/react-router";

export default function UnpackageLink () {
    return <Link to="/unpackage"><MuiLink component="span">Go here to unpackage FlowFile(s).</MuiLink></Link>;
}