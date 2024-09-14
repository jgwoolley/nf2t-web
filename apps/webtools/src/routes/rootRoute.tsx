import { createRootRoute } from "@tanstack/react-router";
import Nf2tContextProvider from "../components/Nf2tContextProvider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Nf2tContainer from "../components/Nf2tContainer";
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from "@mui/material";

const rootRoute = createRootRoute({
  component: () => {
    const client = new QueryClient();
    const theme = createTheme({
      palette: {
        mode: 'dark',
      },
    });

    return (
      <QueryClientProvider client={client}>
        <Nf2tContextProvider>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <Nf2tContainer />
          </ThemeProvider>
        </Nf2tContextProvider>
      </QueryClientProvider>
    )
  }
});

export default rootRoute;