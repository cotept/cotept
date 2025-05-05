import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
// import { ReactQueryDevtools } from "react-query/devtools"
import { type ReactNode } from "react"

interface ProvidersProps {
  children: ReactNode
}
const queryClient = new QueryClient()

const Provider = ({ children }: ProvidersProps) => {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* <ReactQueryDevtools initialIsOpen={false} /> */}
    </QueryClientProvider>
  )
}

export default Provider
