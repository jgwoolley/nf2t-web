import { createLazyRoute } from "@tanstack/react-router";
import Nf2tHeader from "../components/Nf2tHeader";
import Spacing from "../components/Spacing";
import { Button, Table, TableBody, TableCell, TableRow } from "@mui/material";
import { useNf2tContext } from "../hooks/useNf2tContext";

export const Route = createLazyRoute("/settings")({
    component: SettingsComponent,
})

function SettingsComponent() {
    const {
        reactRouterDebug,
        setReactRouterDebug,
        // colorMode,
        // setColorMode,
    } = useNf2tContext();

    return (
        <>
            <Nf2tHeader to="/settings" />
            <Spacing />
            <Table>
                <TableBody>
                    {/* <TableRow>
                        <TableCell>Color Mode</TableCell>
                        <TableCell>
                            <Button variant={colorMode === "dark" ? "contained" : "outlined"} onClick={() => setColorMode(colorMode === "dark" ? "light" : "dark")}>{colorMode}</Button>
                        </TableCell>
                    </TableRow> */}
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