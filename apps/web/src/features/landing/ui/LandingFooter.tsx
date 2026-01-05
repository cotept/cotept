import React from "react"

import Link from "next/link"

import { Terminal } from "lucide-react"

import Logo from "@/shared/ui/Logo"

export const LandingFooter = () => {
  return (
    <footer className="border-t border-white/5 bg-zinc-900/50 py-10">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-6 flex flex-col items-start justify-between gap-4">
          <div className="max-w-xl">
            <Link href="/" className="group mb-6 flex cursor-pointer items-center justify-start gap-2">
              <Logo size={"sm"} variant={"primary"} margin={false} />
            </Link>
            <p className="text-sm font-light leading-relaxed text-zinc-400">
              Real-time coding mentorship for ambitious developers.
              <br />
              개발자를 위한 1:1 실시간 코딩 테스트 멘토링 플랫폼.
            </p>
          </div>
          <div className="flex flex-wrap gap-x-8 gap-y-2 text-sm font-medium text-gray-400 lg:justify-end">
            <a className="hover:text-primary transition-colors" href="#">
              이용약관
            </a>
            <a className="hover:text-primary font-semibold text-gray-300 transition-colors" href="#">
              개인정보처리방침
            </a>
          </div>
        </div>
        <div className="flex items-center justify-between gap-4 border-t border-white/5 text-xs font-bold uppercase tracking-widest text-zinc-500 md:flex-row">
          <p>© 2024 Cotept. All rights reserved.</p>
          <div className="flex items-center gap-1 opacity-50 transition-opacity hover:opacity-100">
            <span>Designed for Developers</span>
            <Terminal className="h-4 w-4" />
          </div>
        </div>
      </div>
    </footer>
  )
}
