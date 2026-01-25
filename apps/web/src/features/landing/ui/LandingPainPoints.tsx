import React from "react"

import { Brain, HelpCircle, Signpost } from "lucide-react"

import {
  FeatureCard,
  FeatureCardDescription,
  FeatureCardIcon,
  FeatureCardTitle,
} from "@/features/landing/ui/components/FeatureCard"

export const LandingPainPoints = () => {
  const items = [
    {
      icon: Signpost,
      title: "어디서부터 시작해야 할지 모르겠어요",
      desc: "자료는 많은데 나에게 맞는 학습 로드맵을 찾기 어려워요. 내 수준에 딱 맞는 시작점이 필요해요.",
    },
    {
      icon: HelpCircle,
      title: "많이 풀어보세요... 그 다음은?",
      desc: "문제 풀이 양치기만으로 실력이 늘지 않는 기분이에요. 효율적인 문제 해결 전략이 궁금하지 않나요?",
    },
    {
      icon: Brain,
      title: "내가 성장하고 있는 걸까요?",
      desc: "피드백 없이 혼자 공부하다 보니 확신이 없어요. 전문가의 코드 리뷰와 객관적인 평가가 필요해요.",
    },
  ]

  return (
    <section className="py-10">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-16 text-center">
          <h2 className="text-foreground mb-4 text-4xl font-black">이런 고민, 하고 계신가요?</h2>
          <p className="text-muted-foreground mx-auto max-w-lg font-semibold">
            혼자 준비하는 코딩 테스트, 막막함의 이유를 찾아보세요.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {items.map((step, idx) => (
            <FeatureCard key={idx}>
              <FeatureCardIcon icon={step.icon} />
              <FeatureCardTitle>{step.title}</FeatureCardTitle>
              <FeatureCardDescription>{step.desc}</FeatureCardDescription>
            </FeatureCard>
          ))}
        </div>
      </div>
    </section>
  )
}
