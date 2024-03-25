import { Typography } from "@mui/material";
import { useEffect, useMemo } from "react";
import ExternalLink from "./ExternalLink";
import { RouteDescription, RoutePathType, routeDescriptions } from "../routes/routeDescriptions";

export function useNf2tHeader({name, shortName}: RouteDescription) {
    useEffect(() => {
        document.title = `FlowFile Tools - ${shortName || name}`;
    }, [shortName, name])

    const headerTitle = useMemo(() => `FlowFile Tools - ${name}`, [name]);

    return headerTitle;
}

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