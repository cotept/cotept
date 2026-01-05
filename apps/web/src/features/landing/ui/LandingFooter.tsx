import React from "react"

import { Terminal } from "lucide-react"

export const LandingFooter = () => {
  return (
    <footer className="border-t border-white/5 bg-zinc-900/50 py-10">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-5 flex flex-col items-start justify-between gap-12 md:flex-row">
          <div className="max-w-xs">
            <div className="group mb-6 flex cursor-pointer items-center gap-2">
              <div className="bg-brand-primary/20 text-brand-primary flex h-8 w-8 items-center justify-center rounded-lg transition-transform group-hover:scale-110">
                <Terminal className="h-5 w-5" />
              </div>
              <span className="text-xl font-black tracking-tight text-white">Cotept</span>
            </div>
            <p className="mb-6 text-sm font-medium leading-relaxed text-zinc-400">
              성장에 목마른 개발자를 위한 실시간 멘토링
            </p>
          </div>
        </div>
        <div className="flex flex-col items-center justify-between gap-4 border-t border-white/5 pt-8 text-xs font-bold uppercase tracking-widest text-zinc-500 md:flex-row">
          <p>© 2024 Cotept Inc. All rights reserved.</p>
          <div className="flex items-center gap-1 opacity-50 transition-opacity hover:opacity-100">
            <span>CotePT</span>
            <Terminal className="h-[14px] w-[14px]" />
          </div>
        </div>
      </div>
    </footer>
  )
}
