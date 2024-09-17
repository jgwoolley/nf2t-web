import { Link } from "@tanstack/react-router";
import { Link as MuiLink } from "@mui/material";

export function NarReaderBackLink() {
    return (
        <Link to="/narReader"><MuiLink component="span">Navigate here to reprocess the nars.</MuiLink></Link>
    )
}

export default NarReaderBackLink;