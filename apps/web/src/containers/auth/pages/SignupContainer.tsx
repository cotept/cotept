"use client"

import { useState } from "react"

import { useRouter, useSearchParams } from "next/navigation"

// UI 컴포넌트 import
import { FormStep } from "@repo/shared/src/components/form-step"

import { Sparkles } from "lucide-react"

import type {
  EmailStepData,
  PasswordStepData,
  ProfileStepData,
  SetUserIdData,
  TermsStepData,
  VerificationStepData,
} from "@/features/auth/lib/validations/auth-rules"

// Step 컴포넌트들 import
import EmailStep from "@/features/auth/components/EmailStep"
import PasswordStep from "@/features/auth/components/PasswordStep"
import ProfileStep from "@/features/auth/components/ProfileStep"
import SetUserIdStep from "@/features/auth/components/SetUserIdStep"
import TermsStep from "@/features/auth/components/TermsStep"
import VerificationStep from "@/features/auth/components/VerificationStep"
import { SIGNUP_STEPS, type SignupStep } from "@/shared/constants/basic-types"

// 전체 회원가입 데이터 타입
interface SignupData {
  email?: EmailStepData
  password?: PasswordStepData
  terms?: TermsStepData
  userId?: SetUserIdData
  verification?: VerificationStepData
  profile?: ProfileStepData
}

// 단계별 설정 타입
interface StepConfig {
  title: string
  description?: string
  subDescription?: string
  icon?: React.ReactNode
  align?: "left" | "center"
}

// 단계별 제목 및 설명 설정
const STEP_CONFIGS: Record<SignupStep, StepConfig> = {
  [SIGNUP_STEPS.ENTER_EMAIL]: {
    title: "이메일로 시작하기",
  },
  [SIGNUP_STEPS.VERIFY_EMAIL]: {
    title: "이메일 인증",
  },
  [SIGNUP_STEPS.SET_PASSWORD]: {
    title: "비밀번호 설정",
    description: "안전한 비밀번호를 설정해주세요",
  },
  [SIGNUP_STEPS.TERMS_AGREEMENT]: {
    title: "약관 동의",
    description: "원활한 CotePT 서비스 이용을 위해 약관에 동의해주세요",
  },
  [SIGNUP_STEPS.SET_USERID]: {
    title: "아이디 입력",
  },
  [SIGNUP_STEPS.PROFILE_SETUP]: {
    title: "프로필 설정",
    description: "마지막으로 닉네임을 설정해주세요",
    icon: <Sparkles className="h-6 w-6 text-purple-400" />,
    align: "left",
  },
}

export default function SignupContainer() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // URL에서 현재 단계 읽기, 기본값은 이메일 단계
  const currentStep = (searchParams.get("step") as SignupStep) || SIGNUP_STEPS.ENTER_EMAIL

  // 각 단계별 데이터 상태
  const [signupData, setSignupData] = useState<SignupData>({})

  /**
   * 단계별 완료 핸들러들
   */
  const handleEmailComplete = (data: EmailStepData) => {
    setSignupData((prev) => ({ ...prev, email: data }))
    router.push(`/auth/signup?step=${SIGNUP_STEPS.VERIFY_EMAIL}`)
  }

  const handleVerificationComplete = (data: VerificationStepData) => {
    setSignupData((prev) => ({ ...prev, verification: data }))
    router.push(`/auth/signup?step=${SIGNUP_STEPS.SET_PASSWORD}`)
  }

  const handlePasswordComplete = (data: PasswordStepData) => {
    setSignupData((prev) => ({ ...prev, password: data }))
    router.push(`/auth/signup?step=${SIGNUP_STEPS.TERMS_AGREEMENT}`)
  }

  const handleTermsComplete = (data: TermsStepData) => {
    setSignupData((prev) => ({ ...prev, terms: data }))
    router.push(`/auth/signup?step=${SIGNUP_STEPS.SET_USERID}`)
  }

  const handleSetUserIdComplete = (data: SetUserIdData) => {
    setSignupData((prev) => ({ ...prev, userId: data }))
    router.push(`/auth/signup?step=${SIGNUP_STEPS.PROFILE_SETUP}`)
  }

  const handleProfileComplete = async (data: ProfileStepData) => {
    const finalData = { ...signupData, profile: data }

    try {
      // TODO: 실제 회원가입 API 호출
      console.log("회원가입 데이터:", finalData)

      // 성공 시 로그인 페이지로 이동
      router.push("/auth/login?message=signup-success")
    } catch (error) {
      console.error("회원가입 실패:", error)
      // TODO: 에러 처리
    }
  }

  /**
   * 단계별 컴포넌트 렌더링
   */
  const renderCurrentStep = () => {
    switch (currentStep) {
      case SIGNUP_STEPS.ENTER_EMAIL:
        return <EmailStep onComplete={handleEmailComplete} />

      case SIGNUP_STEPS.SET_PASSWORD:
        return <PasswordStep onComplete={handlePasswordComplete} />

      case SIGNUP_STEPS.SET_USERID:
        return <SetUserIdStep onComplete={handleSetUserIdComplete} />

      case SIGNUP_STEPS.TERMS_AGREEMENT:
        return <TermsStep onComplete={handleTermsComplete} />

      case SIGNUP_STEPS.VERIFY_EMAIL:
        return <VerificationStep email={signupData.email?.email || ""} onComplete={handleVerificationComplete} />

      case SIGNUP_STEPS.PROFILE_SETUP:
        return <ProfileStep onComplete={handleProfileComplete} />

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
    <div className="flex min-h-screen items-center justify-center bg-black p-4">
      <div className="w-full max-w-md">
        {/* 스텝 인디케이터 */}
        <div className="mb-8">
          <div className="mb-4 flex justify-center space-x-2">
            {Object.values(SIGNUP_STEPS).map((step, index) => (
              <div
                key={step}
                className={`h-2 w-2 rounded-full ${
                  step === currentStep
                    ? "bg-purple-400"
                    : Object.values(SIGNUP_STEPS).indexOf(currentStep) > index
                      ? "bg-gray-400"
                      : "bg-gray-600"
                }`}
              />
            ))}
          </div>
          {/* 로고 영역 */}
          <div className="mb-8 text-center">
            <h1 className="mb-6 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-3xl font-bold text-transparent">
              COTEPT
            </h1>
          </div>
        </div>
        <div className="mx-auto w-full max-w-md">
          {/* 메인 카드 */}
          <div className="space-y-6 rounded-xl border border-zinc-700/50 bg-zinc-800/50 p-8">
            {/* FormStep 래퍼로 현재 단계 컴포넌트 감싸기 */}
            <FormStep
              title={STEP_CONFIGS[currentStep].title}
              description={STEP_CONFIGS[currentStep].description}
              subDescription={STEP_CONFIGS[currentStep].subDescription}
              icon={STEP_CONFIGS[currentStep].icon}
              align={STEP_CONFIGS[currentStep].align}>
              {renderCurrentStep()}
            </FormStep>
          </div>
        </div>
      </div>
    </div>
  )
}
