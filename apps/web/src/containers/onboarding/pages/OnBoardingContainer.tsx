"use client"

import { FormStep } from "@repo/shared/src/components/form-step"

import { BarChart3, BookOpen, CheckCircle, FileText, Tags, User } from "lucide-react"

import type { ProfileSetupData } from "@/features/onboarding/lib/validations/onboarding-rules"

import { ProfileSetupStep } from "@/features/onboarding/components/ProfileSetupStep"
import { useOnboardingSteps } from "@/features/onboarding/hooks/useOnboardingSteps"
import { ONBOARDING_STEPS, type OnboardingStep } from "@/shared/constants/basic-types"
import Logo from "@/shared/ui/Logo"

// 단계별 설정 타입
interface StepConfig {
  title: string
  description?: string
  icon?: React.ReactNode
}

// 단계별 제목 및 설명 설정
const STEP_CONFIGS: Record<OnboardingStep, StepConfig> = {
  [ONBOARDING_STEPS.PROFILE_SETUP]: {
    title: "프로필 설정",
    description: "기본 프로필 정보를 입력해주세요",
    icon: <User className="h-6 w-6 text-purple-400" />,
  },
  [ONBOARDING_STEPS.BAEKJOON_VERIFY]: {
    title: "백준 인증",
    description: "백준 계정을 연동하여 실력을 분석합니다",
    icon: <BookOpen className="h-6 w-6 text-purple-400" />,
  },
  [ONBOARDING_STEPS.SKILL_ANALYSIS]: {
    title: "실력 분석",
    description: "해결한 문제를 분석하여 실력을 평가합니다",
    icon: <BarChart3 className="h-6 w-6 text-purple-400" />,
  },
  [ONBOARDING_STEPS.MENTOR_TAGS]: {
    title: "멘토링 태그",
    description: "멘토링 가능한 분야를 선택해주세요",
    icon: <Tags className="h-6 w-6 text-purple-400" />,
  },
  [ONBOARDING_STEPS.MENTOR_INTRO]: {
    title: "멘토 소개",
    description: "멘토 프로필을 작성해주세요",
    icon: <FileText className="h-6 w-6 text-purple-400" />,
  },
  [ONBOARDING_STEPS.COMPLETE]: {
    title: "온보딩 완료",
    description: "CotePT와 함께 코딩 테스트 실력을 향상시켜보세요!",
    icon: <CheckCircle className="h-6 w-6 text-purple-400" />,
  },
}

const OnBoardingContainer = () => {
  const { currentStep, currentStepIndex, updateAndGoNext, isStepCompleted, totalSteps } = useOnboardingSteps()

  const handleProfileSetupComplete = (data: ProfileSetupData) => {
    updateAndGoNext("profile", data, ONBOARDING_STEPS.BAEKJOON_VERIFY)
  }

  // 스텝별 컴포넌트 렌더링
  const renderCurrentStep = () => {
    switch (currentStep) {
      case ONBOARDING_STEPS.PROFILE_SETUP:
        return <ProfileSetupStep onComplete={handleProfileSetupComplete} />

      case ONBOARDING_STEPS.BAEKJOON_VERIFY:
        return <div className="text-muted-foreground text-center">백준 인증 단계 (구현 예정)</div>

      case ONBOARDING_STEPS.SKILL_ANALYSIS:
        return <div className="text-muted-foreground text-center">실력 분석 단계 (구현 예정)</div>

      case ONBOARDING_STEPS.MENTOR_TAGS:
        return <div className="text-muted-foreground text-center">멘토링 태그 단계 (구현 예정)</div>

      case ONBOARDING_STEPS.MENTOR_INTRO:
        return <div className="text-muted-foreground text-center">멘토 소개 단계 (구현 예정)</div>

      case ONBOARDING_STEPS.COMPLETE:
        return <div className="text-muted-foreground text-center">온보딩 완료 단계 (구현 예정)</div>

      default:
        return (
          <div className="text-center">
            <h2 className="mb-4 text-xl">알 수 없는 단계</h2>
            <p className="text-muted-foreground">잘못된 단계입니다.</p>
          </div>
        )
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-black p-4">
      <div className="w-full max-w-md">
        {/* 스텝 인디케이터 */}
        <div className="mb-8">
          <div className="mb-4 flex justify-center space-x-2">
            {Array.from({ length: totalSteps }).map((_, index) => (
              <div
                key={index}
                className={`h-2 w-2 rounded-full ${
                  index === currentStepIndex
                    ? "bg-purple-400"
                    : isStepCompleted(Object.values(ONBOARDING_STEPS)[index])
                      ? "bg-gray-400"
                      : "bg-gray-600"
                }`}
              />
            ))}
          </div>
          {/* 로고 영역 */}
          <Logo />
        </div>
        {/* 메인 카드 */}
        <div className="mx-auto w-full max-w-md">
          <div className="space-y-6 rounded-xl border border-zinc-700/50 bg-zinc-800/50 p-7">
            {/* FormStep 래퍼로 현재 단계 컴포넌트 감싸기 */}
            <FormStep
              title={STEP_CONFIGS[currentStep].title}
              description={STEP_CONFIGS[currentStep].description}
              icon={STEP_CONFIGS[currentStep].icon}>
              {renderCurrentStep()}
            </FormStep>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OnBoardingContainer
