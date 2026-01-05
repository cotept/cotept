"use client"

import Link from "next/link"

import { StepDots } from "@repo/shared/components/step-dots"
import { FormStep } from "@repo/shared/src/components/form-step"
import FormStepContent from "@repo/shared/src/components/form-step-content"
import StepFlowLayout from "@repo/shared/src/components/step-flow-layout"

import { Sparkles } from "lucide-react"

import type {
  EmailStepData,
  PasswordStepData,
  SetUserIdData,
  TermsStepData,
  VerificationStepData,
} from "@/features/auth/lib/validations/auth-rules"

import EmailStep from "@/features/auth/components/signup/EmailStep"
import PasswordStep from "@/features/auth/components/signup/PasswordStep"
import SetUserIdStep from "@/features/auth/components/signup/SetUserIdStep"
import SignupCompleteStep from "@/features/auth/components/signup/SignupCompleteStep"
import TermsStep from "@/features/auth/components/signup/TermsStep"
import VerificationStep from "@/features/auth/components/signup/VerificationStep"
import { useSignupSteps } from "@/features/auth/hooks/signup/useSignupSteps"
import { SIGNUP_STEP_ORDER, SIGNUP_STEPS, type SignupStep } from "@/shared/types/basic-types"
import Logo from "@/shared/ui/Logo"

interface StepConfig {
  title: string
  description?: string
  subDescription?: string
  icon?: React.ReactNode
  align?: "left" | "center"
}

const STEP_CONFIGS: Record<SignupStep, StepConfig> = {
  [SIGNUP_STEPS.TERMS_AGREEMENT]: {
    title: "약관 동의",
    description: "원활한 CotePT 서비스 이용을 위해 약관에 동의해주세요",
  },
  [SIGNUP_STEPS.ENTER_EMAIL]: {
    title: "이메일로 시작하기",
  },
  [SIGNUP_STEPS.VERIFY_EMAIL]: {
    title: "이메일 인증",
  },
  [SIGNUP_STEPS.SET_USERID]: {
    title: "아이디 입력",
  },
  [SIGNUP_STEPS.SET_PASSWORD]: {
    title: "비밀번호 설정",
    description: "안전한 비밀번호를 설정해주세요",
  },
  [SIGNUP_STEPS.SIGNUP_COMPLETE]: {
    title: "회원가입",
    description: "CotePT와 함께 코딩 테스트 실력을 향상시켜보세요!",
    icon: <Sparkles className="h-6 w-6 text-purple-400" />,
    align: "left",
  },
}

export default function SignupContainer() {
  const { currentStep, currentStepIndex, signupData, updateAndGoNext, isStepCompleted, totalSteps } = useSignupSteps()

  /**
   * 단계별 완료 핸들러 - 중복 코드 제거
   */
  const handleTermsComplete = (data: TermsStepData) => {
    updateAndGoNext("terms", data, SIGNUP_STEPS.ENTER_EMAIL)
  }

  const handleEmailComplete = (data: EmailStepData) => {
    updateAndGoNext("email", data, SIGNUP_STEPS.VERIFY_EMAIL)
  }

  const handleVerificationComplete = (data: VerificationStepData) => {
    updateAndGoNext("verification", data, SIGNUP_STEPS.SET_USERID)
  }

  const handleSetUserIdComplete = (data: SetUserIdData) => {
    updateAndGoNext("userId", data, SIGNUP_STEPS.SET_PASSWORD)
  }

  const handlePasswordComplete = (data: PasswordStepData) => {
    updateAndGoNext("password", data, SIGNUP_STEPS.SIGNUP_COMPLETE)
  }

  const handleSignupComplete = async () => {
    // 최종 회원가입 처리
  }

  /**
   * 단계별 컴포넌트 렌더링
   */
  const renderCurrentStep = () => {
    switch (currentStep) {
      case SIGNUP_STEPS.TERMS_AGREEMENT:
        return <TermsStep onComplete={handleTermsComplete} />

      case SIGNUP_STEPS.ENTER_EMAIL:
        return <EmailStep onComplete={handleEmailComplete} />

      case SIGNUP_STEPS.VERIFY_EMAIL:
        return <VerificationStep email={signupData.email?.email || ""} onComplete={handleVerificationComplete} />

      case SIGNUP_STEPS.SET_USERID:
        return <SetUserIdStep onComplete={handleSetUserIdComplete} />

      case SIGNUP_STEPS.SET_PASSWORD:
        return <PasswordStep onComplete={handlePasswordComplete} />

      case SIGNUP_STEPS.SIGNUP_COMPLETE:
        return <SignupCompleteStep onComplete={handleSignupComplete} signupData={signupData} />

      default:
        return (
          <div className="text-center text-white">
            <h2 className="mb-4 text-xl">알 수 없는 단계</h2>
            <p className="text-zinc-400">잘못된 단계입니다.</p>
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
          stepOrder={SIGNUP_STEP_ORDER}
        />
        <Logo />
      </div>
      <FormStepContent>
        <FormStep
          title={STEP_CONFIGS[currentStep].title}
          description={STEP_CONFIGS[currentStep].description}
          subDescription={STEP_CONFIGS[currentStep].subDescription}
          icon={STEP_CONFIGS[currentStep].icon}
          align={STEP_CONFIGS[currentStep].align}>
          {renderCurrentStep()}
        </FormStep>
      </FormStepContent>
      {currentStep === SIGNUP_STEPS.TERMS_AGREEMENT && (
        <div className="pt-4 text-center">
          <p className="space-x-1 text-sm text-zinc-400">
            <span className="">이미 코테피티의 회원이신가요?</span>
            <Link href="/auth/signin" className="text-purple-400 underline hover:text-purple-300">
              로그인 하러가기
            </Link>
          </p>
        </div>
      )}
    </StepFlowLayout>
  )
}
