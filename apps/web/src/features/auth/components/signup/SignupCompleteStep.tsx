"use client"

import React from "react"

import { Button } from "@repo/shared/src/components/button"
import { StatusMessage } from "@repo/shared/src/components/status-message"

import { PartyPopper, Sparkles } from "lucide-react"

import { useSignupComplete } from "@/features/auth/hooks/signup/useSignupComplete"
import { SignupData } from "@/features/auth/lib/validations/auth-rules"

interface SignupCompleteStepProps {
  onComplete: () => void
  signupData: SignupData
}

const SignupCompleteStep: React.FC<SignupCompleteStepProps> = ({ onComplete, signupData }) => {
  // 훅에서 상태 및 핸들러 가져오기
  const {
    handleSignupComplete,
    isLoading,
    isSuccess,
    isError,
    errorMessage,
    // handleGoToOnboarding,
    handleGoToLogin,
    handleGoToSignUp,
  } = useSignupComplete({ signupData, onComplete })

  // 기본 상태: 가입하기 버튼만 표시
  if (!isSuccess && !isError) {
    return (
      <Button
        type="button"
        variant="auth-special"
        size="xl"
        onClick={handleSignupComplete}
        disabled={isLoading}
        className="w-full">
        <div className="flex items-center space-x-2">
          <Sparkles className="h-4 w-4" />
          <span>
            {isLoading ? (
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              "가입 하기"
            )}
          </span>
        </div>
      </Button>
    )
  }

  // 성공 상태: 축하 메시지 + 다음 단계 선택
  if (isSuccess) {
    return (
      <>
        <StatusMessage
          variant="success"
          message="회원가입이 완료되었습니다."
          icon={<PartyPopper className="h-4 w-4 text-green-400" />}>
          <p className="mt-2 text-sm text-green-400">로그인 후 코테PT의 모든 기능을 경험해 보세요!</p>
        </StatusMessage>

        {/* 다음 단계 선택 */}
        <Button type="button" variant="auth-primary" size="lg" onClick={handleGoToLogin} className="w-full">
          <div className="flex items-center space-x-2">
            <span>로그인</span>
          </div>
        </Button>
      </>
    )
  }

  // 실패 상태: 에러 메시지 + 재시도 버튼
  if (isError) {
    return (
      <>
        <StatusMessage variant="error" message={errorMessage?.message || "회원가입 처리 중 오류가 발생했습니다."}>
          {errorMessage?.messageDetails && (
            <div className="mt-2 flex justify-center">
              <ul className="list-decimal text-left text-sm text-red-300">
                {errorMessage.messageDetails.map((detail, index) => (
                  <li key={index}>{detail}</li>
                ))}
              </ul>
            </div>
          )}
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={handleSignupComplete}
            disabled={isLoading}
            className="mt-3">
            <div className="flex items-center space-x-2">
              <span>다시 시도</span>
            </div>
          </Button>
        </StatusMessage>
        <Button
          type="button"
          variant="outline"
          size="xl"
          onClick={handleGoToSignUp}
          disabled={isLoading}
          className="mt-3 w-full">
          <div className="flex items-center space-x-2">
            <span>처음으로 돌아가기</span>
          </div>
        </Button>
      </>
    )
  }

  return null
}

export default SignupCompleteStep
