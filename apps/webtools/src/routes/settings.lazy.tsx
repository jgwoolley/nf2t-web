import { createLazyRoute } from "@tanstack/react-router";
import Nf2tHeader from "../components/Nf2tHeader";
import Spacing from "../components/Spacing";
import { Button, MenuItem, Select, Table, TableBody, TableCell, TableRow } from "@mui/material";
import { useNf2tContext } from "../hooks/useNf2tContext";

export const Route = createLazyRoute("/settings")({
    component: SettingsComponent,
})

function SettingsComponent() {
    const {
        reactRouterDebug,
        setReactRouterDebug,
        colorMode,
        setColorMode,
    } = useNf2tContext();

    return (
        <>
            <Nf2tHeader to="/settings" />
            <Spacing />
            <Table>
                <TableBody>
                    <TableRow>
                        <TableCell>Color Mode</TableCell>
                        <TableCell>
                        <Select
                            value={colorMode}
                            onChange={(event) => {
                                if(event.target.value === "light" || event.target.value === "dark" || event.target.value === "system") {
                                    setColorMode(event.target.value);
                                }
                            }}
                        >
                            <MenuItem value="system">System</MenuItem>
                            <MenuItem value="light">Light</MenuItem>
                            <MenuItem value="dark">Dark</MenuItem>
                        </Select>
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>Debug Mode</TableCell>
                        <TableCell>
                            <Button variant={reactRouterDebug ? "contained" : "outlined"} onClick={() => setReactRouterDebug(!reactRouterDebug)}>{reactRouterDebug ? "On" : "Off"}</Button>
                        </TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </>
    )
}