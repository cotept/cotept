import localFont from "next/font/local"

import { Toaster } from "@repo/shared/components/sonner"

import "@repo/shared/globals.css"

import Providers from "@/app/_provider/Providers"

const pretendard = localFont({
  src: "../fonts/PretendardVariable.woff2",
  display: "swap",
  weight: "45 920",
  variable: "--font-pretendard",
})

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className={pretendard.variable}>
        <Providers>{children}</Providers>
        <Toaster />
        <div id="overlay-root"></div>
      </body>
    </html>
  )
}
