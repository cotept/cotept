import { useState } from "react"

import { useRouter } from "next/navigation"

import { UserRole } from "@repo/api-client/src/types/user-role"

import type { UserApiCreateUserRequest } from "@repo/api-client/src"

import { SignupData, validateFinalCompletion } from "@/features/auth/lib/validations/auth-rules"
import { useSignupUser } from "@/features/user/api/mutations"

interface UseSignupCompleteProps {
  signupData: SignupData
  onComplete: () => void
}

export function useSignupComplete({ signupData, onComplete }: UseSignupCompleteProps) {
  const router = useRouter()
  const { mutate: signupUser, isPending: isSignupPending, error: apiError, isError: hasApiError } = useSignupUser()

  // 내부 상태 관리
  const [isSuccess, setIsSuccess] = useState(false)
  const [validationError, setValidationError] = useState<{
    message: string
    messageDetails?: string[]
  }>({ message: "" })

  const handleSignupComplete = () => {
    // 검증 에러 상태 초기화
    setValidationError({ message: "" })

    // 1단계: 최종 종합 검증
    const validation = validateFinalCompletion(signupData)

    if (!validation.isValid) {
      const errorMsg = Object.values(validation.errors)
      setValidationError({ message: `회원가입 정보를 확인해주세요.`, messageDetails: errorMsg })
      return
    }

    // 2단계: 타입 안전성을 위한 재확인 (이미 검증됨)
    if (!signupData.email?.email || !signupData.password?.password || !signupData.userId?.userId) {
      setValidationError({ message: "회원가입 정보가 완전하지 않습니다. 다시 시도해주세요." })
      return
    }

    // 3단계: API 호출을 위한 데이터 변환
    const createUserRequestDto = {
      email: signupData.email.email,
      password: signupData.password.password,
      userId: signupData.userId.userId,
      role: UserRole.MENTEE, // 기본값은 멘티
    }

    const createUserData: UserApiCreateUserRequest = { createUserRequestDto }

    // 4단계: 회원가입 API 호출
    signupUser(createUserData, {
      onSuccess: (response) => {
        console.log("회원가입 성공:", response)
        setIsSuccess(true)
        onComplete() // 성공 시 상위 컴포넌트에 알림
      },
      onError: (error: any) => {
        console.error("회원가입 실패:", error)
        // API 에러는 useSignupUser에서 자동으로 관리됨
      },
    })
  }

  // 회원가입 시작 페이지로 이동
  const handleGoToSignUp = () => {
    router.push("/auth/signup")
  }

  // 온보딩 페이지로 이동
  const handleGoToOnboarding = () => {
    router.push("/onboarding")
  }

  // 홈 페이지로 이동
  const handleGoToHome = () => {
    router.push("/")
  }
  // 로그인 페이지로 이동
  const handleGoToLogin = () => {
    router.push("/auth/signin")
  }

  return {
    handleSignupComplete,
    isLoading: isSignupPending,
    isSuccess,
    // 에러 처리: 검증 에러 또는 API 에러
    isError: !!validationError || hasApiError,
    errorMessage:
      validationError || (apiError as any)?.response?.data?.message || "회원가입 처리 중 오류가 발생했습니다.",
    handleGoToOnboarding,
    handleGoToHome,
    handleGoToSignUp,
    handleGoToLogin,
  }
}
