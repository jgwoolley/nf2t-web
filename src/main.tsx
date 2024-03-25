import React from 'react'
import ReactDOM from 'react-dom/client'
import {
  RouterProvider,
  createRouter,
} from '@tanstack/react-router'
import rootRoute from './routes/rootRoute';
import {route as buildInfo } from "./routes/info/buildInfo";
import {route as technologiesInfo } from "./routes/info/technologiesInfo";
import {route as attributesLookup } from "./routes/lookup/attributesLookup";
import {route as extensionLookup } from "./routes/lookup/extensionLookup";
import {route as narLookup } from "./routes/lookup/narLookup";
import {route as narReader } from "./routes/lookup/narReader";
import {route as packageFlowFile } from "./routes/package/package";
import {route as unpackageFlowFile } from "./routes/unpackage/unpackage";
import {route as bulkUnpackageFlowFile } from "./routes/unpackage/bulkUnpackage";
import {route as source } from "./routes/source";
import {route as home } from "./routes/home";

const routeTree = rootRoute.addChildren([
  buildInfo,
  technologiesInfo,
  attributesLookup,
  extensionLookup,
  narLookup,
  narReader,
  packageFlowFile,
  unpackageFlowFile,
  bulkUnpackageFlowFile,
  source,
  home,
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