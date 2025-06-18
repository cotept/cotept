"use client"

import "@repo/shared/globals.css"

import ReactQueryProvider from "@/app/_provider/ReactQueryProvider"
// import { ThemeProvider } from "@/app/_provider/ThemeProvider"

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>
        <ReactQueryProvider>{children}</ReactQueryProvider>
      </body>
    </html>
  )
}
