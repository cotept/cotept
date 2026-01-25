import { PropsWithChildren } from "react"

import ReactQueryProvider from "@/app/_provider/ReactQueryProvider"
import { SessionProvider } from "@/app/_provider/SessionProvider"
import { ThemeProvider } from "@/app/_provider/ThemeProvider"
import { auth } from "@/auth"
import { DefaultOverlayProvider } from "@/shared/ui/overlay/createOverlayContext"

const Providers = async ({ children }: PropsWithChildren) => {
  const session = await auth()

  return (
    <ReactQueryProvider>
      <SessionProvider session={session}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <DefaultOverlayProvider>{children}</DefaultOverlayProvider>
        </ThemeProvider>
      </SessionProvider>
    </ReactQueryProvider>
  )
}

export default Providers
