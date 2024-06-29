import { Outlet, createRootRoute } from "@tanstack/react-router";
import Nf2tContextProvider, { useNf2tContext } from "../components/Nf2tContextProvider";
import { Container, } from "@mui/material";
import Nf2tAppBar from "../components/Nf2tAppBar";
import Spacing from "../components/Spacing";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";

function InnerComponent() {
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

const rootRoute = createRootRoute({
  component: () => {
    return (
      <Nf2tContextProvider>
        <InnerComponent />
      </Nf2tContextProvider>
    )
  }
});

export default rootRoute;