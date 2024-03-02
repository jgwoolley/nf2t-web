import { AppBar, Container, MenuItem, Toolbar, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import ExternalLink from "./ExternalLink";

export function NifiAppBar() {
    return (
        <AppBar position="static">
            <Container maxWidth="xl">
                <Toolbar disableGutters >
                    {/* <img src="https://nifi.apache.org/assets/images/apache-nifi-logo.svg" height="25px"/> */}
                    <Typography variant="h6" color="inherit" component="div">Nifi Flow File Tools</Typography>
                        <MenuItem component={Link} to="/unpackage">Unpackage</MenuItem>
                        <MenuItem component={Link} to="/bulkUnpackage">Bulk Unpackage</MenuItem>
                        <MenuItem component={Link} to="/package">Package</MenuItem>
                        <MenuItem component={Link} to="/source">Source</MenuItem>
                        <MenuItem><ExternalLink style={{color: "inherit", textDecoration: "inherit"}} href="https://nifi.apache.org/docs.html">Nifi Docs</ExternalLink></MenuItem>
                </Toolbar>
            </Container>
        </AppBar>
    )
}

export default NifiAppBar;