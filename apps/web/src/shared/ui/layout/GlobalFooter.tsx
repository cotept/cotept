// import Link from "next/link"

import Link from "next/link"

// import { Terminal } from "lucide-react"

// import Logo from "@/shared/ui/Logo"

export function GlobalFooter() {
  return (
    // <footer className="border-static-white/5 bg-muted/50 border-t py-10">
    //   <div className="mx-auto max-w-7xl px-6">
    //     <div className="mb-6 flex flex-col items-start justify-between gap-4">
    //       <div className="max-w-xl">
    //         <Link href="/" className="group mb-6 flex cursor-pointer items-center justify-start gap-2">
    //           <Logo size={"sm"} variant={"primary"} margin={false} />
    //         </Link>
    //         <p className="text-muted-foreground text-sm font-light leading-relaxed">
    //           개발자를 위한 1:1 실시간 코딩 테스트 멘토링 플랫폼.
    //         </p>
    //       </div>
    //       <div className="text-muted-foreground flex flex-wrap gap-x-8 gap-y-2 text-sm font-medium lg:justify-end">
    //         <a className="hover:text-foreground transition-colors" href="#">
    //           이용약관
    //         </a>
    //         <a className="hover:text-foreground transition-colors" href="#">
    //           개인정보처리방침
    //         </a>
    //       </div>
    //     </div>
    //     <div className="text-muted-foreground border-static-white/5 flex items-center justify-between gap-4 border-t text-xs font-bold uppercase tracking-widest md:flex-row">
    //       <p>© 2024 Cotept. All rights reserved.</p>
    //       <div className="flex items-center gap-1 opacity-50 transition-opacity hover:opacity-100">
    //         <span>Designed for Developers</span>
    //         <Terminal className="h-4 w-4" />
    //       </div>
    //     </div>
    //   </div>
    // </footer>
    <footer className="border-border mt-auto border-t py-10 text-center">
      <p className="text-muted-foreground text-xs">© 2024 Cotept. All rights reserved.</p>
      <div className="mt-2 flex justify-center gap-4">
        <Link className="text-muted-foreground hover:text-primary text-xs transition-colors" href="/terms/service">
          이용약관
        </Link>
        <Link className="text-muted-foreground hover:text-primary text-xs font-bold transition-colors" href="/terms/privacy">
          개인정보처리방침
        </Link>
      </div>
    </footer>
  )
}
