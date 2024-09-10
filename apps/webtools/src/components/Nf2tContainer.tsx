import { Outlet } from "@tanstack/react-router";
import { Container, } from "@mui/material";
import Nf2tAppBar from "../components/Nf2tAppBar";
import Spacing from "../components/Spacing";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import { useNf2tContext } from "../hooks/useNf2tContext";

export default function Nf2tContainer() {
    const {
      reactRouterDebug,
      // colorMode: mode, 
      // setColorMode: setMode,
    } = useNf2tContext();
  
    // const colorMode = useMemo(
    //   () => ({
    //     toggleColorMode: () => {
    //       setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
    //     },
    //   }),
    //   [],
    // );
  
    // const theme = useMemo(
    //   () =>
    //     createTheme({
    //       palette: {
    //         mode,
    //       },
    //     }),
    //   [colorMode],
    // );
  
    return (
      // <ColorModeContext.Provider value={colorMode}>
      //   <ThemeProvider theme={theme}>
      <Container >
        <Nf2tAppBar />
        <div style={{ marginTop: "10px" }} />
        <Outlet />
        <Spacing height="100px" />
        {reactRouterDebug && <TanStackRouterDevtools />}
      </Container>
      //   </ThemeProvider>
      // </ColorModeContext.Provider>
    )
  }