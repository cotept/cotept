'use client'

import React from "react"

import "./app.css"

import Provider from "~/app/providers/Provider"
import ReactQueryProvider from "~/app/providers/ReactQueryProvider"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <ReactQueryProvider>
          <Provider>
            {children}
          </Provider>
        </ReactQueryProvider>
      </body>
    </html>
  )
} 