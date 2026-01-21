"use client"

import Link from "next/link"

import { Badge } from "@repo/shared/components/badge"
import { Button } from "@repo/shared/components/button"
import { StatusMessage } from "@repo/shared/components/status-message"

import type { OnboardingData } from "@/features/onboarding/lib/validations/onboarding-rules"

interface OnboardingCompleteStepProps {
  onboardingData: OnboardingData
}

export function OnboardingCompleteStep({ onboardingData }: OnboardingCompleteStepProps) {
  const nickname = onboardingData.profile?.nickname ?? "코테피티 사용자"
  const isMentor = Boolean(onboardingData.wantsToBeMentor || onboardingData.mentorProfile)

  const primaryHref = isMentor ? "/mentoring" : "/"
  const primaryLabel = isMentor ? "멘토링 시작하기" : "멘토 찾아보기"
  const roleLabel = isMentor ? "멘토" : "멘티"

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 space-y-8 duration-700">
      <StatusMessage variant="transparent" shape={"outline"} message={`✨${nickname}님의 온보딩이 완료되었습니다!`}>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          <Badge variant="secondary" className="border-none bg-green-500/20 px-3 py-1 text-green-300">
            {roleLabel}로 시작합니다!
          </Badge>
        </div>
      </StatusMessage>
      <div className="group overflow-hidden rounded-lg border border-white/5 bg-white/[0.02] p-6 transition-all hover:bg-white/[0.04]">
        {/* <p className="text-center text-sm leading-relaxed text-white"> */}
        <p className="text-center text-sm leading-relaxed text-zinc-300">
          {isMentor ? (
            <>
              멘토링 세션 포스트를 작성하고,
              <br /> 멘티들을 만나 소중한 경험을 나눠보세요.
            </>
          ) : (
            <>
              나에게 딱 맞는 멘토를 찾아보고,
              <br /> 성장을 위한 첫 걸음을 내디뎌 보세요.
            </>
          )}
        </p>
      </div>
      <div className="flex flex-col gap-4">
        <Button asChild variant="cta-primary" size="xl" className="w-full">
          <Link href={primaryHref}>{primaryLabel}</Link>
        </Button>
        <Button asChild variant="ghost" className="h-12 w-full text-zinc-300 hover:bg-white/5 hover:text-zinc-100">
          <Link href="/onboarding?step=profile-setup">정보 수정이 필요하신가요?</Link>
        </Button>
      </div>
    </div>
  )
}
