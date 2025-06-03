"use client"

import "@repo/shared/globals.css"

import ReactQueryProvider from "@/app/_provider/ReactQueryProvider"
import { ThemeProvider } from "@/app/_provider/ThemeProvider"

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>
        <ReactQueryProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            {children}
          </ThemeProvider>
        </ReactQueryProvider>
      </body>
    </html>
  )
}
