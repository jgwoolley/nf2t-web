import { MenuItem, Tooltip, Typography } from "@mui/material"
import { Link } from "@tanstack/react-router";
import Spacing from "./Spacing";
import { RoutePathType, routeDescriptions } from "../routes/routeDescriptions";

const linkStyles: React.CSSProperties = {
    color: "inherit",
    textDecoration: "inherit",
}

export type PrevNextProps = {
    prev?: RoutePathType,
    next?: RoutePathType,
}

export default function PrevNext({ prev, next }: PrevNextProps) {
    const prevDescription = prev ? routeDescriptions[prev] : undefined;
    const nextDescription = next ? routeDescriptions[next]: undefined;

    return (
        <>
            <Typography variant="h6" component="h6">
                More Information...
            </Typography>
            <Spacing />
            <table style={{tableLayout: "fixed", width: "100%"}}>
                <tbody>
                <tr>         
                        {prevDescription && (
                            <Tooltip title={prevDescription.shortDescription}>
                                <td>
                                    <Link style={linkStyles} to={prevDescription.to}>
                                    <MenuItem>
                                        ← {prevDescription.name} 
                                    </MenuItem>
                                    </Link>                              
                                </td>
                            </Tooltip>
                        )}             
                        {nextDescription && (
                            <Tooltip title={nextDescription.shortDescription}>
                                <td >
                                    <Link style={linkStyles} to={nextDescription.to}>
                                        <MenuItem>
                                                <>{nextDescription.name} →</>                                           
                                        </MenuItem>
                                    </Link>
                                </td>
                            </Tooltip>
                        )}        
                    </tr>
                </tbody>
            </table>
        </>
    )
}