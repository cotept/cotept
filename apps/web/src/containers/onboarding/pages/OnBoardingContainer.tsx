"use client"

import { useEffect } from "react"

import FormStepContent from "@repo/shared/components/form-step-content"
import { FormStep } from "@repo/shared/src/components/form-step"
import { StepDots } from "@repo/shared/src/components/step-dots"
import StepFlowLayout from "@repo/shared/src/components/step-flow-layout"

import { BookOpen, CheckCircle, FileText, User } from "lucide-react"

import type {
  BaekjoonVerifyStepData,
  MentorIntroData,
  MentorTagsData,
  ProfileSetupData,
} from "@/features/onboarding/lib/validations/onboarding-rules"

import { BaekjoonVerifyStep } from "@/features/onboarding/components/BaekjoonVerifyStep"
import { OnboardingCompleteStep } from "@/features/onboarding/components/OnboardingCompleteStep"
import { MentorProfileSetupStep } from "@/features/onboarding/components/MentorProfileSetupStep"
import { MentorProfileSetupSkeleton } from "@/features/onboarding/components/MentorProfileSetupSkeleton"
import { ProfileSetupStep } from "@/features/onboarding/components/ProfileSetupStep"
import { OnboardingDebugPanel } from "@/features/onboarding/components/OnboardingDebugPanel"
import { useMentorProposal } from "@/features/onboarding/hooks/useMentorProposal"
import { useOnboardingFlowPersistence } from "@/features/onboarding/hooks/useOnboardingFlowPersistence"
import { useOnboardingSteps } from "@/features/onboarding/hooks/useOnboardingSteps"
import { useOnboardingStepGuard } from "@/features/onboarding/hooks/useOnboardingStepGuard"
import { ONBOARDING_STEP_ORDER, ONBOARDING_STEPS, type OnboardingStep } from "@/shared/types/basic-types"
import Logo from "@/shared/ui/Logo"
import { ClientOnly } from "@/shared/ui/client-only/ClientOnly"
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
    icon: <BookOpen className="h-6 w-6 text-purple-400" />,
  },
  [ONBOARDING_STEPS.MENTOR_SETUP]: {
    title: "멘토 프로필 작성",
    // description: "멘토 프로필을 작성해주세요",
    icon: <FileText className="h-6 w-6 text-purple-400" />,
  },
  [ONBOARDING_STEPS.COMPLETE]: {
    title: "온보딩 완료",
    description: "CotePT와 함께 코딩 테스트 실력을 향상시켜보세요!",
    icon: <CheckCircle className="h-6 w-6 text-purple-400" />,
  },
}

const OnBoardingContainer = () => {
  const {
    currentStep,
    currentStepIndex,
    onboardingData,
    setOnboardingData,
    goToStep,
    updateAndGoNext,
    isStepCompleted,
    totalSteps,
    handleMentorProposal,
  } = useOnboardingSteps()

  useOnboardingStepGuard({ currentStep, onboardingData, goToStep })
  const { clearPersistedFlow } = useOnboardingFlowPersistence({
    onboardingData,
    setOnboardingData,
  })

  useEffect(() => {
    if (currentStep === ONBOARDING_STEPS.COMPLETE) {
      clearPersistedFlow()
    }
  }, [currentStep, clearPersistedFlow])

  // 멘토 제안 훅
  const { checkEligibility } = useMentorProposal({
    onAccept: () => handleMentorProposal(true),
    onDecline: () => handleMentorProposal(false),
  })

  const handleProfileSetupComplete = (data: ProfileSetupData) => {
    updateAndGoNext("profile", data, ONBOARDING_STEPS.BAEKJOON_VERIFY)
  }

  const handleBaekjoonVerifyComplete = (data: BaekjoonVerifyStepData) => {
    // 백준 인증 데이터 저장
    checkEligibility(data.baekjoonHandle)
    // 멘토 자격 체크 및 제안 모달 표시
    updateAndGoNext("baekjoonVerification", data, ONBOARDING_STEPS.BAEKJOON_VERIFY)
  }

  const handleMentorProfileComplete = (data: { tags: MentorTagsData; intro: MentorIntroData }) => {
    updateAndGoNext("mentorProfile", data, ONBOARDING_STEPS.COMPLETE)
  }

  // 스텝별 컴포넌트 렌더링
  const renderCurrentStep = () => {
    switch (currentStep) {
      case ONBOARDING_STEPS.PROFILE_SETUP:
        return <ProfileSetupStep onComplete={handleProfileSetupComplete} />

      case ONBOARDING_STEPS.BAEKJOON_VERIFY:
        return <BaekjoonVerifyStep onComplete={handleBaekjoonVerifyComplete} />

      case ONBOARDING_STEPS.MENTOR_SETUP:
        return (
          <ClientOnly fallback={<MentorProfileSetupSkeleton />}>
            <MentorProfileSetupStep
              profile={onboardingData.profile}
              initialData={onboardingData.mentorProfile}
              onComplete={handleMentorProfileComplete}
            />
          </ClientOnly>
        )

      case ONBOARDING_STEPS.COMPLETE:
        return <OnboardingCompleteStep onboardingData={onboardingData} />

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
    <StepFlowLayout>
      <div className="mb-8">
        {/* 스텝 인디케이터 */}
        <StepDots
          totalSteps={totalSteps}
          currentStepIndex={currentStepIndex}
          isStepCompleted={isStepCompleted}
          stepOrder={ONBOARDING_STEP_ORDER}
        />
        {/* 로고 영역 */}
        <Logo />
      </div>
      {/* 메인 카드 */}
      <FormStepContent>
        <FormStep
          title={STEP_CONFIGS[currentStep].title}
          description={STEP_CONFIGS[currentStep].description}
          icon={STEP_CONFIGS[currentStep].icon}>
          {renderCurrentStep()}
        </FormStep>
      </FormStepContent>
      <OnboardingDebugPanel
        setOnboardingData={setOnboardingData}
        goToStep={goToStep}
        clearPersistedFlow={clearPersistedFlow}
      />
    </StepFlowLayout>
  )
}

export default OnBoardingContainer
