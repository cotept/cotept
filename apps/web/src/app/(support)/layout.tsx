import GlobalContainer from "@/shared/ui/layout/GlobalContainer"
import { GlobalFooter } from "@/shared/ui/layout/GlobalFooter"

export default function SupportLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* <GlobalHeader /> */}
      <GlobalContainer>{children}</GlobalContainer>
      <GlobalFooter />
    </>
  )
}
