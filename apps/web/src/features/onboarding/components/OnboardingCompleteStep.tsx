"use client"

import { useSession } from "next-auth/react"
import Link from "next/link"
import { useRouter } from "next/navigation"

import { Badge } from "@repo/shared/components/badge"
import { Button } from "@repo/shared/components/button"
import { StatusMessage } from "@repo/shared/components/status-message"

import type { OnboardingData } from "@/features/onboarding/lib/validations/onboarding-rules"

interface OnboardingCompleteStepProps {
  onboardingData: OnboardingData
}

export function OnboardingCompleteStep({ onboardingData }: OnboardingCompleteStepProps) {
  const router = useRouter()
  const { update } = useSession()

  const nickname = onboardingData.profile?.nickname ?? "코테피티 사용자"
  const isMentor = Boolean(onboardingData.wantsToBeMentor || onboardingData.mentorProfile)

  const primaryHref = isMentor ? "/mentoring" : "/"
  const primaryLabel = isMentor ? "멘토링 시작하기" : "멘토 찾아보기"
  const roleLabel = isMentor ? "멘토" : "멘티"

  const handleStart = async () => {
    // 세션 갱신 요청 (Backend DB -> Session Cookie Sync)
    await update({ trigger: "ONBOARDING_UPDATE" })

    // 갱신 후 이동 (Proxy Guard 통과)
    router.push(primaryHref)
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 space-y-8 duration-700">
      <StatusMessage variant="transparent" shape={"outline"} message={`${nickname}님의 온보딩이 완료되었습니다!`}>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          <Badge variant="secondary" className="bg-success/20 text-success border-none px-3 py-1">
            {roleLabel}로 시작합니다!
          </Badge>
        </div>
      </StatusMessage>
      <div className="flex flex-col gap-4">
        <Button onClick={handleStart} variant="auth-primary" size="xl" className="w-full">
          {primaryLabel}
        </Button>
        <Button
          asChild
          variant="ghost"
          className="text-muted-foreground hover:bg-accent hover:text-foreground h-12 w-full">
          <Link href="/onboarding?step=profile-setup">정보 수정이 필요하신가요?</Link>
        </Button>
      </div>
    </div>
  )
}
