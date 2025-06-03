"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { type ReactNode, useState } from "react"

interface Props {
  children: ReactNode
}

const getQueryClient = (): QueryClient =>
  new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        refetchInterval: false,
        refetchOnReconnect: true,
        refetchOnMount: true,
        staleTime: Infinity,
        gcTime: Infinity,
        retry: false,
      },
    },
  })

export default function ReactQueryProvider({ children }: Props) {
  const [queryClient] = useState(getQueryClient)
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={process.env.NODE_ENV !== "production"} />
    </QueryClientProvider>
  )
}
