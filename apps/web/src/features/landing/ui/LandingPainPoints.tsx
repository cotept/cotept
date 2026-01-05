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
      desc: "알고리즘 공부, 막막하게 느껴지시나요?",
    },
    {
      icon: HelpCircle,
      title: "많이 풀어보세요... 그 다음은?",
      desc: "구체적인 피드백 없이 혼자 헤매고 계신가요?",
    },
    {
      icon: Brain,
      title: "내가 성장하고 있는 걸까요?",
      desc: "내 실력이 늘고 있는지 확신이 서지 않으시나요?",
    },
  ]

  return (
    <section className="py-10">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-4xl font-black text-white">이런 고민, 하고 계신가요?</h2>
          <p className="mx-auto max-w-lg text-zinc-400">열심히는 하고 있는데 잘 하고 있는 지는 모르겠어요</p>
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
