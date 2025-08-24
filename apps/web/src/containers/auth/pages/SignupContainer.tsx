"use client"

import { useState } from "react"

import { useRouter, useSearchParams } from "next/navigation"

import type {
  EmailStepData,
  PasswordStepData,
  ProfileStepData,
  TermsStepData,
  VerificationStepData,
} from "@/features/auth/lib/validations/auth-rules"

// Step 컴포넌트들 import
import EmailStep from "@/features/auth/components/EmailStep"
import PasswordStep from "@/features/auth/components/PasswordStep"
import ProfileStep from "@/features/auth/components/ProfileStep"
import TermsStep from "@/features/auth/components/TermsStep"
import VerificationStep from "@/features/auth/components/VerificationStep"
import { SIGNUP_STEPS, type SignupStep } from "@/shared/constants/basic-types"

// 전체 회원가입 데이터 타입
interface SignupData {
  email?: EmailStepData
  password?: PasswordStepData
  terms?: TermsStepData
  verification?: VerificationStepData
  profile?: ProfileStepData
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
    router.push(`/auth/signup?step=${SIGNUP_STEPS.SET_PASSWORD}`)
  }

  const handlePasswordComplete = (data: PasswordStepData) => {
    setSignupData((prev) => ({ ...prev, password: data }))
    router.push(`/auth/signup?step=${SIGNUP_STEPS.TERMS_AGREEMENT}`)
  }

  const handleTermsComplete = (data: TermsStepData) => {
    setSignupData((prev) => ({ ...prev, terms: data }))
    router.push(`/auth/signup?step=${SIGNUP_STEPS.VERIFY_EMAIL}`)
  }

  const handleVerificationComplete = (data: VerificationStepData) => {
    setSignupData((prev) => ({ ...prev, verification: data }))
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

      case SIGNUP_STEPS.TERMS_AGREEMENT:
        return <TermsStep onComplete={handleTermsComplete} />

      case SIGNUP_STEPS.VERIFY_EMAIL:
        return <VerificationStep email={signupData.email?.email || ""} onComplete={handleVerificationComplete} />

      case SIGNUP_STEPS.PROFILE_SETUP:
        return <ProfileStep onComplete={handleProfileComplete} />

      default:
        return (
          <div className="text-center text-white">
            <h2 className="text-xl mb-4">알 수 없는 단계</h2>
            <p className="text-zinc-400">잘못된 step 파라미터입니다.</p>
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* 진행 상황 표시 */}
        <div className="mb-8">
          <div className="flex justify-center space-x-2 mb-4">
            {Object.values(SIGNUP_STEPS).map((step, index) => (
              <div
                key={step}
                className={`w-2 h-2 rounded-full ${
                  step === currentStep
                    ? "bg-purple-400"
                    : Object.values(SIGNUP_STEPS).indexOf(currentStep) > index
                      ? "bg-gray-400"
                      : "bg-gray-600"
                }`}
              />
            ))}
          </div>
          <p className="text-center text-gray-400 text-sm">
            {Object.values(SIGNUP_STEPS).indexOf(currentStep) + 1} / {Object.values(SIGNUP_STEPS).length}
          </p>
        </div>

        {/* 현재 단계 컴포넌트 */}
        {renderCurrentStep()}
      </div>
    </div>
  )
}
