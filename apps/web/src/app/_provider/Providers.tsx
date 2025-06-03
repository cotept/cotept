import ReactQueryProvider from "@/app/_provider/ReactQueryProvider"
import { ThemeProvider } from "@/app/_provider/ThemeProvider"
import { PropsWithChildren } from "react"

const Providers = ({ children }: PropsWithChildren) => {
  return (
    <ReactQueryProvider>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
        {children}
      </ThemeProvider>
    </ReactQueryProvider>
  )
}

export default Providers
