import React from 'react'
import ReactDOM from 'react-dom/client'
import {
  Outlet,
  RouterProvider,
  createRouter,
  createRoute,
  createRootRoute,
} from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'
import { Container } from '@mui/material';
import Nf2tAppBar from './components/Nf2tAppBar';
import UnpackageFlowFile from './routes/UnpackageFlowFile';
import BulkUnpackageFlowFile from './routes/BulkUnpackageFlowFile';
import PackageFlowFile from './routes/PackageFlowFile';
import Nf2tSource from './routes/Nf2tSource';
import Nf2tHome from './routes/Nf2tHome';
import Spacing from './components/Spacing';
import TechnologyTable from './routes/TechnologyTable';
import BuildProcess from './routes/BuildProcess';
import NarReader from './routes/NarReader';
import Nf2tContextProvider from './components/Nf2tContextProvider';
import LookupAttribute from './routes/LookupAttribute';
import { z } from 'zod';

const debug = false;

export const rootRoute = createRootRoute({
  component: () => {
    return (
      <Nf2tContextProvider>
        <Container >
          <Nf2tAppBar />
          <div style={{ marginTop: "10px" }} />
          <Outlet />
          <Spacing height="100px" />
          {debug && <TanStackRouterDevtools />}
        </Container>
        </Nf2tContextProvider>
    )
  }
});

export const IndexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: Nf2tHome,
});

export const UnpackageFlowFileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/unpackage",
  component: UnpackageFlowFile,
});

export const BulkUnpackageFlowFileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/bulkUnpackage",
  component: BulkUnpackageFlowFile,
});

export const PackageFlowFileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/package",
  component: PackageFlowFile,
});

export const SourceRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/source",
  component: Nf2tSource,
});

export const TechnologyTableRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/technologyTable",
  component: TechnologyTable,
});

export const BuildProcessRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/buildProcess",
  component: BuildProcess,
});

export const NarReaderRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/narReader",
  component: NarReader,
})

export const LookupAttributeSearchParamsSchema = z.object({
  name: z.string(),
})

export const LookupAttributeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/lookupAttribute",
  validateSearch: (search: Record<string, unknown>) => {
    return LookupAttributeSearchParamsSchema.parse(search);
  },
  component: LookupAttribute,
})

const routeTree = rootRoute.addChildren([
  IndexRoute,
  UnpackageFlowFileRoute,
  BulkUnpackageFlowFileRoute,
  PackageFlowFileRoute,
  SourceRoute,
  TechnologyTableRoute,
  BuildProcessRoute,
  NarReaderRoute,
  LookupAttributeRoute,
]);

const router = createRouter({
  routeTree,
  basepath: import.meta.env.BASE_URL,
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

const rootElement = document.getElementById('root')!
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(
    <React.StrictMode>
      <RouterProvider router={router} />
    </React.StrictMode>,
  )
}