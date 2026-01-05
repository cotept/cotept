import React from "react"

import Link from "next/link"

import { Button } from "@repo/shared/components/button"

import { ArrowRight } from "lucide-react"

export const LandingCTA = () => {
  return (
    <section className="bg-background relative overflow-hidden py-10">
      <div className="mx-auto max-w-4xl px-6 text-center">
        <h2 className="mb-8 text-4xl font-black text-white">
          이제 혼자 고민하지 마세요 <br />
          <span className="text-2xl text-zinc-500">오늘부터 멘토와 함께 시작하세요</span>
        </h2>
        {/* <Button className="bg-brand-primary group relative inline-flex h-auto items-center justify-center overflow-hidden rounded-2xl px-10 py-5 text-lg font-bold text-white transition-all hover:scale-105 hover:shadow-[0_0_40px_rgba(124,59,237,0.4)] active:scale-95"> */}
        <Link href="/auth/signup">
          <Button
            variant={"onboarding-complete"}
            size="lg"
            className="group relative inline-flex h-14 items-center justify-center overflow-hidden rounded-xl px-8 py-5 text-base font-bold text-white transition-all hover:scale-105 hover:shadow-[0_0_40px_rgba(124,59,237,0.4)] active:scale-95">
            <span className="relative z-10 flex items-center gap-2">
              멘토링 시작하기
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </span>
          </Button>
        </Link>
      </div>
    </section>
  )
}
