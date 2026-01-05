import React from "react"

import { BadgeCheck, Code, MonitorPlay } from "lucide-react"

import {
  FeatureCard,
  FeatureCardDescription,
  FeatureCardIcon,
  FeatureCardTitle,
} from "@/features/landing/ui/components/FeatureCard"

export const LandingFeatures = () => {
  const features = [
    {
      icon: Code,
      title: "실시간으로 함께 코드를 작성해요",
      desc: "강력한 동시 편집 에디터와 음성 대화로 마치 옆에 있는 것처럼 소통하세요.",
    },
    {
      icon: BadgeCheck,
      title: "백준 플래티넘 이상, 검증된 실력",
      desc: "solved.ac 티어로 인증된 검증된 멘토들이 여러분을 기다립니다.",
    },
    {
      icon: MonitorPlay,
      title: "멘토링을 언제든 다시 볼 수 있어요",
      desc: "모든 멘토링 세션은 자동 녹화되어 언제든지 다시 보며 복습할 수 있습니다.",
    },
  ]

  return (
    <section className="relative overflow-hidden py-24" id="features">
      <div className="bg-brand-primary/10 absolute right-0 top-0 -z-10 h-96 w-96 rounded-full blur-[100px]"></div>

      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-4xl font-black text-white">코테피티가 해결해드립니다</h2>
          <p className="mx-auto max-w-2xl font-semibold text-zinc-400">
            개발자 성장을 위한 최고의 1:1 실시간 멘토링 솔루션을 경험하세요.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {features.map((feature, idx) => (
            <FeatureCard key={idx} variant="simple">
              <FeatureCardIcon icon={feature.icon} className="mb-6 h-14 w-14 rounded-xl" iconClassName="h-8 w-8" />
              <FeatureCardTitle className="mb-4 text-xl">{feature.title}</FeatureCardTitle>
              <FeatureCardDescription>{feature.desc}</FeatureCardDescription>
            </FeatureCard>
          ))}
        </div>
      </div>
    </section>
  )
}
