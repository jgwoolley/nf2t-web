import { Link } from "@tanstack/react-router";
import { Fragment } from "react";
import { Link as MuiLink } from "@mui/material";

export default function ExtensionTagCell({ tags }: { tags?: string[] }) {
    if(!tags) {
        return null;
    }

    return (
        <>{tags.map((tag, index) => (
            <Fragment key={index}><Link search={{ tag: tag }} to="/extensionList"><MuiLink>{tag}</MuiLink></Link>{index < tags.length - 1 && ", "}</Fragment>
        ))}</>
    )
}

