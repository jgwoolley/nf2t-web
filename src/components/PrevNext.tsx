import { MenuItem, Tooltip, Typography } from "@mui/material"
import { Link } from "@tanstack/react-router";
import Spacing from "./Spacing";
import { RouteDescription } from "../routes/createRouteDescription";

const linkStyles: React.CSSProperties = {
    color: "inherit",
    textDecoration: "inherit",
}

export type PrevNextProps = {
    prev?: RouteDescription,
    next?: RouteDescription,
}

export default function PrevNext({ prev, next }: PrevNextProps) {
    return (
        <>
            <Typography variant="h6" component="h6">
                More Information...
            </Typography>
            <Spacing />
            <table style={{tableLayout: "fixed", width: "100%"}}>
                <tbody>
                <tr>         
                        {prev && (
                            <Tooltip title={prev.shortDescription}>
                                <td>
                                    <Link style={linkStyles} to={prev.route.path}>
                                    <MenuItem>
                                        ← {prev.name} 
                                    </MenuItem>
                                    </Link>                              
                                </td>
                            </Tooltip>
                        )}             
                        {next && (
                            <Tooltip title={next.shortDescription}>
                                <td >
                                    <Link style={linkStyles} to={next.route.path}>
                                        <MenuItem>
                                                <>{next.name} →</>                                           
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