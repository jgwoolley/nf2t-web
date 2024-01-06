import { AppBar, Container, MenuItem, Toolbar, Typography } from "@mui/material";
import { Link } from "react-router-dom";

export function NifiAppBar() {
    return (
        <AppBar position="static">
            <Container maxWidth="xl">
                <Toolbar disableGutters >
                    {/* <img src="https://nifi.apache.org/assets/images/apache-nifi-logo.svg" height="25px"/> */}
                    <Typography variant="h6" color="inherit" component="div">Apache Nifi Flow File Tools</Typography>
                        <MenuItem component={Link} to="/unpackage">UnPackage</MenuItem>
                        <MenuItem component={Link} to="/package">Package</MenuItem>
                        <MenuItem component={Link} to="https://github.com/jgwoolley/Nifi-Flow-File-Helper">Source</MenuItem>
                        <MenuItem component={Link} to="https://nifi.apache.org/docs.html">Nifi Docs</MenuItem>
                </Toolbar>
            </Container>
        </AppBar>
    )
}

export default NifiAppBar;