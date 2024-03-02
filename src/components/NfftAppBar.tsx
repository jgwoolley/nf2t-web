import { AppBar, Container, MenuItem, Toolbar, Tooltip, Typography } from "@mui/material";
import { Link } from "@tanstack/react-router";
import ExternalLink from "./ExternalLink";
import { routeDescriptions } from "./NfftHeader";

export function NifiAppBar() {
    const linkStyles: React.CSSProperties = {
        color: "inherit",
        textDecoration: "inherit",
    }

    return (
        <AppBar position="static">
            <Container maxWidth="xl">
                <Toolbar disableGutters >   
                    <Tooltip title={routeDescriptions.home.shortDescription}>
                        <>
                            {/* <img src="https://nifi.apache.org/assets/images/apache-nifi-logo.svg" height="25px"/> */}
                            <Typography variant="h6" color="inherit" component="div"><Link style={{ color: "inherit", textDecoration: "inherit" }} to="/">Nifi Flow File Tools</Link></Typography>
                        </>
                    </Tooltip>
                    <Tooltip title={routeDescriptions.unpackage.shortDescription}>
                        <MenuItem><Link style={{ ...linkStyles }} to="/unpackage">Unpackage</Link></MenuItem>
                    </Tooltip>
                    <Tooltip title={routeDescriptions.bulkUnpackage.shortDescription}>
                        <MenuItem><Link style={{ ...linkStyles }} to="/bulkUnpackage">Bulk Unpackage</Link></MenuItem>
                    </Tooltip>
                    <Tooltip title={routeDescriptions.package.shortDescription}>
                        <MenuItem><Link style={{ ...linkStyles }} to="/package">Package</Link></MenuItem>
                    </Tooltip>
                    <Tooltip title={routeDescriptions.source.shortDescription}>
                        <MenuItem><Link style={{ ...linkStyles }} to="/source">Source</Link></MenuItem>
                    </Tooltip>
                    <Tooltip title="External Apache Nifi Documentation.">
                        <MenuItem><ExternalLink style={{ ...linkStyles }} href="https://nifi.apache.org/docs.html">Nifi Docs</ExternalLink></MenuItem>
                    </Tooltip>
                </Toolbar>
            </Container>
        </AppBar>
    )
}

export default NifiAppBar;