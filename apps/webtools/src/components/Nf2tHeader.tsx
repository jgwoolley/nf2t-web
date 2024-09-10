import { Typography } from "@mui/material";
import ExternalLink from "./ExternalLink";
import { RoutePathType, routeDescriptions } from "../routes/routeDescriptions";
import useNf2tHeader from "../hooks/useNf2tHeader";

export interface Nf2tHeaderProps {
    to: RoutePathType,
}

export default function Nf2tHeader({to}: Nf2tHeaderProps) {
    const props = routeDescriptions[to]
    const title = useNf2tHeader(props);

    return (
        <>
            <Typography variant="h5" component="h5">
                { title }
            </Typography>
            <p>{props.description || props.shortDescription}</p>
            {props.source && (
                <p>{props.source.prefix} <ExternalLink href={props.source.url}>{props.source.name}</ExternalLink>.</p>
            )}
        </>
    )
}