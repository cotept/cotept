"use client"

import "@repo/shared/globals.css"

import Providers from "@/app/_provider/Providers"

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
        <div id="overlay-root"></div>
      </body>
    </html>
  )
}
