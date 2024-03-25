import { AppBar, Container, Menu, MenuItem, Stack, Toolbar, Tooltip, Typography } from "@mui/material";
import { Link } from "@tanstack/react-router";
import ExternalLink from "./ExternalLink";
import { useState } from "react";
import { description as homeDescription } from "../routes/home";
import { description as narReaderDescription } from "../routes/lookup/narReader";
import { description as packageDescription } from "../routes/package/package";
import { description as unpackageDescription } from "../routes/unpackage/unpackage";
import { description as bulkUnpackageDescription } from "../routes/unpackage/bulkUnpackage";
import { RouteDescription } from "../routes/createRouteDescription";

const linkStyles: React.CSSProperties = {
    color: "inherit",
    textDecoration: "inherit",
}

function Nf2tMenuItem({ route }: { route: RouteDescription }) {
    return (
        <Tooltip title={route.shortDescription}>
            <MenuItem><Link style={{ ...linkStyles }} to={route.route.path}>{route.shortName || route.name}</Link></MenuItem>
        </Tooltip>
    )
}

function Nf2tSettingsMenu() {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const handleClick = (event: React.MouseEvent<HTMLLIElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    return (
        <>
            <Tooltip title="More options.">
                <MenuItem
                    id="basic-button"
                    aria-controls={open ? 'basic-menu' : undefined}
                    aria-haspopup="true"
                    aria-expanded={open ? 'true' : undefined}
                    onClick={handleClick}
                >
                    More
                </MenuItem>
            </Tooltip>
            <Menu
                id="basic-menu"
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                MenuListProps={{
                    'aria-labelledby': 'basic-button',
                }}
            >
                <Nf2tMenuItem route={homeDescription} />
                <Nf2tMenuItem route={narReaderDescription} />
                <Tooltip title="External Apache Nifi Documentation.">
                    <MenuItem><ExternalLink style={{ ...linkStyles }} href="https://nifi.apache.org/docs.html">Nifi Docs</ExternalLink></MenuItem>
                </Tooltip>
            </Menu>
        </>
    )
}

export function NifiAppBar() {
    return (
        <AppBar position="static">
            <Container maxWidth="xl">
                <Toolbar disableGutters >
                    <Tooltip title={homeDescription.shortDescription}>
                        <>
                            {/* <img src="https://nifi.apache.org/assets/images/apache-nifi-logo.svg" height="25px"/> */}
                            <Typography variant="h6" color="inherit" component="div"><Link style={{ color: "inherit", textDecoration: "inherit" }} to="/">Nifi FlowFile Tools</Link></Typography>
                        </>
                    </Tooltip>
                    <div style={{ flex: 1 }} />
                    <Stack direction="row">
                        <Nf2tMenuItem route={unpackageDescription} />
                        <Nf2tMenuItem route={bulkUnpackageDescription} />
                        <Nf2tMenuItem route={packageDescription} />
                        <Nf2tSettingsMenu />
                    </Stack>
                </Toolbar>
            </Container>
        </AppBar>
    )
}

export default NifiAppBar;