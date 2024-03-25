import { Outlet, createRootRoute } from "@tanstack/react-router";
import Nf2tContextProvider from "../components/Nf2tContextProvider";
import { Container } from "@mui/material";
import Nf2tAppBar from "../components/Nf2tAppBar";
import Spacing from "../components/Spacing";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";

const rootRoute = createRootRoute({
  component: () => {
    return (
      <Nf2tContextProvider>
        <Container >
          <Nf2tAppBar />
          <div style={{ marginTop: "10px" }} />
          <Outlet />
          <Spacing height="100px" />
          <TanStackRouterDevtools />
        </Container>
      </Nf2tContextProvider>
    )
  }
});

export default rootRoute;