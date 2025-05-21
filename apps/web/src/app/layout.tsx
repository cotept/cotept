'use client'

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import React from "react"

import "./app.css"

import Provider from "~/app/providers/Provider"

const queryClient = new QueryClient()

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <QueryClientProvider client={queryClient}>
          <Provider>
            {children}
          </Provider>
        </QueryClientProvider>
      </body>
    </html>
  )
} 