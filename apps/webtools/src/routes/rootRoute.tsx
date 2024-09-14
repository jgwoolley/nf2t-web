import { createRootRoute } from "@tanstack/react-router";
import Nf2tContextProvider from "../components/Nf2tContextProvider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Nf2tContainer from "../components/Nf2tContainer";

const rootRoute = createRootRoute({
  component: () => {
    const client = new QueryClient();

    return (
      <QueryClientProvider client={client}>
        <Nf2tContextProvider>
            <Nf2tContainer />
        </Nf2tContextProvider>
      </QueryClientProvider>
    )
  }
});

export default rootRoute;