import { useEffect, useMemo } from "react";
import { RouteDescription } from "../routes/routeDescriptions";

export default function useNf2tHeader({name, shortName}: RouteDescription) {
    useEffect(() => {
        document.title = `FlowFile Tools - ${shortName || name}`;
    }, [shortName, name])

    const headerTitle = useMemo(() => `FlowFile Tools - ${name}`, [name]);

    return headerTitle;
}