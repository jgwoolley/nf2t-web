import React from 'react'
import ReactDOM from 'react-dom/client'
import {
  RouterProvider,
  createHashHistory,
  createRouter,
} from '@tanstack/react-router'
import rootRoute from './routes/rootRoute';
import { routeChildren } from './routes/routeDescriptions';
import { notFoundRoute } from "./routes/notFoundRoute";

const routeTree = rootRoute.addChildren(routeChildren);

const history = createHashHistory();

const router = createRouter({
  history: history,
  routeTree: routeTree ,
  notFoundRoute: notFoundRoute
  // basepath: import.meta.env.BASE_URL, # I believe this is not needed for HashHistory...
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