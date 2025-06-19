"use client"

import "@repo/shared/globals.css"

import ReactQueryProvider from "@/app/_provider/ReactQueryProvider"
import { MSWProvider } from "@/app/_provider/MSWProvider"
// import { ThemeProvider } from "@/app/_provider/ThemeProvider"

if (process.env.NEXT_RUNTIME === "nodejs" && process.env.NODE_ENV !== "production") {
  const server = require("../../mocks/server").default
  server.listen()
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>
        <ReactQueryProvider>
          <MSWProvider>{children}</MSWProvider>
        </ReactQueryProvider>
      </body>
    </html>
  )
}
