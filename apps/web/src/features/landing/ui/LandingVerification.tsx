import React from "react"

import { CheckCircle, FileSearch, Link, ShieldCheck } from "lucide-react"

import {
  FeatureCard,
  FeatureCardDescription,
  FeatureCardIcon,
  FeatureCardTitle,
} from "@/features/landing/ui/components/FeatureCard"

export const LandingVerification = () => {
  const steps = [
    {
      title: "백준 ID 연동",
      desc: "백준 온라인 저지와 연동하여 활동 이력을 불러옵니다.",
      icon: Link,
    },
    {
      title: "solved.ac 티어 확인",
      desc: "공개된 solved.ac 알고리즘 티어를 통해 실력을 검증합니다.",
      icon: FileSearch,
    },
    {
      title: "Platinum 3 이상",
      desc: "실력이 검증된 멘토만 멘토 심사를 통과합니다.",
      icon: ShieldCheck,
      active: true,
    },
    {
      title: "최종 승인",
      desc: "실력이 검증되면 멘토링 권한이 부여됩니다.",
      icon: CheckCircle,
    },
  ]

  return (
    <section className="bg-background overflow-hidden py-10">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-16 text-center">
          <h2 className="mb-6 text-4xl font-black text-white">실력이 검증된 멘토</h2>
          <p className="mx-auto max-w-2xl text-lg font-semibold text-zinc-400">
            코테피티의 모든 멘토는 엄격한 검증 과정을 거칩니다.
          </p>
        </div>

        <div className="relative mb-20 grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="absolute left-0 top-1/2 -z-10 hidden h-0.5 w-full -translate-y-1/2 bg-white/5 md:block"></div>

          {steps.map((step, idx) => (
            <FeatureCard key={idx} variant="center" active={step.active}>
              <FeatureCardIcon
                icon={step.icon}
                variant="circle"
                active={step.active}
                className="h-14 w-14"
                iconClassName="h-8 w-8"
              />
              <FeatureCardTitle>{step.title}</FeatureCardTitle>
              <FeatureCardDescription className="text-xs">{step.desc}</FeatureCardDescription>
            </FeatureCard>
          ))}
        </div>

        {/* Highlight Card */}
        {/* <div className="relative mx-auto flex max-w-4xl flex-col items-center gap-8 overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 md:flex-row md:p-12">
          <div className="bg-brand-primary/10 pointer-events-none absolute right-0 top-0 h-64 w-64 -translate-y-1/2 translate-x-1/2 rounded-full blur-[80px]"></div>

          <div className="z-10 flex-grow text-center md:text-left">
            <h3 className="mb-4 text-3xl font-black text-white">상위 10% 인재</h3>
            <p className="text-lg leading-relaxed text-zinc-400">
              누구나 멘토가 될 수 없습니다. <br />
              검증된 전문가에게 코딩테스트 노하우를 배우세요.
            </p>
          </div>

          <div className="z-10 flex-shrink-0">
            <div className="flex flex-col items-center gap-4">
              <div className="group relative">
                <div className="absolute -inset-1 animate-pulse rounded-2xl bg-gradient-to-r from-emerald-400 to-blue-500 opacity-30 blur transition duration-1000 group-hover:opacity-60"></div>
                <div className="bg-background relative flex items-center gap-4 rounded-xl px-8 py-6 ring-1 ring-white/10">
                  <Medal className="h-10 w-10 text-emerald-400" />
                  <div className="flex flex-col">
                    <span className="text-2xl font-black tracking-tight text-emerald-400">Platinum III</span>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                      Solved.ac 기준
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div> */}
      </div>
    </section>
  )
}
