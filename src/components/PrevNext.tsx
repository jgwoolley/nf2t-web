import { Box, MenuItem, Tooltip } from "@mui/material"
import { Link } from "@tanstack/react-router";
import { RouteDescription } from "./NfftHeader";


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
            <Box >
                {prev && (
                    <MenuItem>
                        <Tooltip title={prev.shortDescription}>
                            <Link style={linkStyles} to={prev.to}>← {prev.name}</Link>
                        </Tooltip>
                    </MenuItem>

                )}
                {next && (
                    <MenuItem>
                        <Tooltip title={next.shortDescription}>
                            <Link style={linkStyles} to={next.to}>{next.name} →</Link>
                        </Tooltip>
                    </MenuItem>
                )}
            </Box>
        </>
    )
}