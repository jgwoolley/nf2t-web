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
import NfftAppBar from './components/NfftAppBar';
import UnpackageFlowFile from './routes/UnpackageFlowFile';
import BulkUnpackageFlowFile from './routes/BulkUnpackageFlowFile';
import PackageFlowFile from './routes/PackageFlowFile';
import NfftSource from './routes/NfftSource';
import NfftHome from './routes/NfftHome';
import Spacing from './components/Spacing';
import TechnologyTable from './routes/TechnologyTable';
import BuildProcess from './routes/BuildProcess';

const debug = false;

const rootRoute = createRootRoute({
  component: () => (
    <Container >
      <NfftAppBar />
      <div style={{ marginTop: "10px" }} />
      <Outlet />
      <Spacing height="100px" />
      {debug && <TanStackRouterDevtools />}
    </Container>
  )
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: NfftHome,
});

const unpackageFlowFileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/unpackage",
  component: UnpackageFlowFile,
});

const bulkUnpackageFlowFileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/bulkUnpackage",
  component: BulkUnpackageFlowFile,
});

const packageFlowFileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/package",
  component: PackageFlowFile,
});

const sourceRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/source", 
  component: NfftSource,
});

const technologyTableRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/technologyTable",
  component: TechnologyTable,
});

const buildProcessRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/buildProcess",
  component: BuildProcess,
});

const routeTree = rootRoute.addChildren([
  indexRoute, 
  unpackageFlowFileRoute,
  bulkUnpackageFlowFileRoute,
  packageFlowFileRoute, 
  sourceRoute,
  technologyTableRoute,
  buildProcessRoute,
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