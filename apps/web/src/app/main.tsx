import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { createRouter, RouterProvider } from "@tanstack/react-router"
import React, { startTransition } from "react"
import ReactDOM from "react-dom/client"

import "./app.css"

import Provider from "~/app/providers/Provider"
import { routeTree } from "~/app/routeTree.gen"

const queryClient = new QueryClient()

// Set up a Router instance
const router = createRouter({
  routeTree,
  context: {
    queryClient,
  },
  defaultPreload: "intent",
  // Since we're using React Query, we don't want loader calls to ever be stale
  // This will ensure that the loader is always called when the route is preloaded or visited
  defaultPreloadStaleTime: 0,
  scrollRestoration: true,
})

// Register things for typesafety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router
  }
}

async function enableMocking() {
  if (import.meta.env.PROD) return
  const { worker } = await import("~/mocks/browser")
  return worker.start()
}
// web/feat/setting_provider
const rootElement = document.getElementById("app")!

if (!rootElement.innerHTML) {
  enableMocking().then(() => {
    startTransition(() => {
      ReactDOM.createRoot(rootElement).render(
        <React.StrictMode>
          <QueryClientProvider client={queryClient}>
            <Provider>
              <RouterProvider router={router} />
            </Provider>
          </QueryClientProvider>
        </React.StrictMode>,
      )
    })
  })
}
