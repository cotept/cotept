import React from "react"

import Link from "next/link"

import { Button } from "@repo/shared/components/button"

import { ArrowRight } from "lucide-react"

export const LandingCTA = () => {
  return (
    <section className="bg-background relative overflow-hidden py-10">
      <div className="mx-auto max-w-4xl px-6 text-center">
        <h2 className="bg-linear-to-b from-foreground to-muted-foreground mb-6 bg-clip-text text-4xl font-extrabold tracking-tight text-transparent sm:text-5xl md:text-6xl lg:text-6xl">
          이제 혼자 고민하지 마세요 <br />
        </h2>
        <p className="text-muted-foreground mx-auto mb-12 max-w-2xl text-lg font-semibold leading-relaxed sm:text-xl">
          막히는 코드, 불안한 취업 준비.
          <br className="hidden sm:block" />
          오늘부터 검증된 현직 멘토와 함께 확실한 성장을 시작하세요.
        </p>
        {/* <Button className="bg-primary group relative inline-flex h-auto items-center justify-center overflow-hidden rounded-2xl px-10 py-5 text-lg font-bold text-static-white transition-all hover:scale-105 hover:shadow-primary/40 active:scale-95"> */}
        <Link href="/auth/signup">
          <Button
            variant={"cta-primary"}
            size="lg"
            className="text-static-white hover:shadow-primary/40 group relative inline-flex h-14 items-center justify-center overflow-hidden rounded-xl px-8 py-5 text-base font-bold transition-all hover:scale-105 active:scale-95">
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
