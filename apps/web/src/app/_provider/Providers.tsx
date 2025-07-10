import { PropsWithChildren } from "react"

import ReactQueryProvider from "@/app/_provider/ReactQueryProvider"
import { SessionProvider } from "@/app/_provider/SessionProvider"
import { ThemeProvider } from "@/app/_provider/ThemeProvider"

const Providers = ({ children }: PropsWithChildren) => {
  return (
    <ReactQueryProvider>
      <SessionProvider>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </SessionProvider>
    </ReactQueryProvider>
  )
}

export default Providers
