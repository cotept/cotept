import React from "react"

import Link from "next/link"

import { Button } from "@repo/shared/components/button"
import { PulseBadge } from "@repo/shared/src/components/pulse-badge"

import { ArrowRight } from "lucide-react"

import { LandingIDEPreview } from "./components/LandingIDEPreview"

export const LandingHero = () => {
  return (
    <section className="bg-background relative flex min-h-screen flex-col justify-center overflow-hidden pb-20 pt-32">
      {/* Background Decor */}
      <div className="bg-size-[40px_40px] pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(var(--foreground-rgb),0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(var(--foreground-rgb),0.05)_1px,transparent_1px)] opacity-30"></div>
      <div className="bg-primary/20 pointer-events-none absolute left-1/2 top-20 h-[400px] w-[800px] -translate-x-1/2 rounded-full blur-[120px]"></div>

      <div className="relative z-10 mx-auto max-w-7xl px-6">
        <div className="mb-16 flex flex-col items-center gap-2 text-center">
          <PulseBadge variant={"default"}>LIVE MENTORING AVAILABLE</PulseBadge>
          <h1 className="text-foreground mb-6 text-5xl font-black leading-[1.1] tracking-[-0.05em] md:text-7xl">
            <span className="bg-linear-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
              검증된 실력의 멘토와
            </span>
            <br />
            <span className="bg-linear-to-r from-primary to-primary-tint bg-clip-text text-transparent">
              실시간 1:1
            </span>
            <span>코딩 멘토링</span>
          </h1>

          <p className="text-muted-foreground mb-6 max-w-3xl text-base font-semibold leading-relaxed md:text-xl">
            실시간 페어 프로그래밍과 개인 맞춤형 피드백으로 <br className="hidden md:block" />
            당신의 성장을 가속화하는 1:1 코딩 멘토링을 경험해 보세요.
          </p>

          <div className="flex flex-col items-center gap-4 sm:flex-row">
            <Link href="/auth/signup">
              <Button variant={"auth-special"} size="xl" className="px-8 text-base font-bold">
                <span className="relative z-10 flex items-center gap-2">
                  시작하기
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </span>
              </Button>
            </Link>
            <Link href="/main">
              <Button variant="inverted" size="xl" className="flex items-center gap-2 px-8 text-base font-bold">
                <span className="relative z-10 flex items-center gap-2">
                  둘러 보기
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </span>
              </Button>
            </Link>
          </div>
        </div>

        {/* IDE Preview Component */}
        <LandingIDEPreview />
      </div>
    </section>
  )
}
