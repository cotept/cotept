"use client"

import { type ReactNode, useState } from "react"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"

interface Props {
  children: ReactNode
}

const getQueryClient = (): QueryClient =>
  new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: true, // 사용자가 창에 다시 포커스했을 때 데이터 갱신
        refetchOnReconnect: true, // 네트워크 재연결 시 데이터 갱신
        refetchOnMount: true, // 컴포넌트 마운트 시 데이터 갱신 (stale 상태일 때)
        retry: 1, // 실패 시 1번 재시도
        staleTime: 1000 * 60 * 5, // 5분
        gcTime: 1000 * 60 * 10, // 10분
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
