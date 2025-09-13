"use client"

import React from "react"

import { Button } from "@repo/shared/src/components/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@repo/shared/src/components/form"
import { Input } from "@repo/shared/src/components/input"
import { StatusMessage } from "@repo/shared/src/components/status-message"

import { useVerificationStep } from "@/features/auth/hooks/signup/useVerificationStep"
import { VerificationStepData } from "@/features/auth/lib/validations/auth-rules"
import { formatTimeMMSS } from "@/shared/utils"

interface VerificationStepProps {
  email: string // SignupContainer에서 이메일 데이터 전달받음
  onComplete: (data: VerificationStepData) => void
}

const VerificationStep: React.FC<VerificationStepProps> = ({ email, onComplete }) => {
  const {
    form,
    handleSubmit,
    sendVerificationCode,
    resendVerificationCode,
    proceedToNextStep,
    clearError,

    // 상태
    cooldownTime,
    canResend,
    isCodeComplete,
    isVerificationSuccess,
    isLoading,

    // 에러 정보
    error,
    hasError,
    canRetryError,

    // 레거시 호환성
    isSending,
    isVerifying,
    isProcessing,
    isPendingVerification,
    hasInitialSent,
  } = useVerificationStep({ email, onComplete })

  // 상태 체크 함수들
  const isInCooldown = () => cooldownTime > 0 && !isShowingSuccessState()
  const isShowingProcessingStatus = () => isProcessing || isPendingVerification || isVerifying
  const shouldShowSpinner = () => isSending
  const isShowingSuccessState = () => isVerificationSuccess
  const shouldShowTimerAndResend = () => !isShowingSuccessState() && !isShowingProcessingStatus()
  const shouldShowErrorMessage = () => hasError && !isShowingSuccessState() && !isShowingProcessingStatus()

  // 텍스트 결정 함수들
  const getInitialButtonText = () => {
    if (shouldShowSpinner()) return "전송 중..."
    return "인증 코드 전송"
  }

  const getResendButtonText = () => {
    if (shouldShowSpinner()) return "전송 중..."
    return "인증 코드 다시 받기"
  }

  const getProcessingStatusText = () => {
    if (isPendingVerification) return "입력 확인 중..."
    if (isVerifying) return "인증 처리 중..."
    return "처리 중..."
  }

  const getSuccessMessage = () => "인증이 완료되었습니다! 다음 단계로 진행해주세요."

  const getErrorMessage = () => {
    if (!error) return ""
    return error.message
  }

  return (
    <>
      {/* 초기 인증 코드 전송 버튼 렌더링 */}
      {!hasInitialSent && (
        <div className="space-y-4 text-start">
          <p className="text-sm text-zinc-400">
            <span className="text-purple-400">{email}</span> 로 인증 코드를 전송해주세요.
          </p>

          <Button
            className="w-full font-bold"
            variant={!hasInitialSent ? "default" : "ghost"}
            onClick={sendVerificationCode}
            disabled={shouldShowSpinner()}>
            {getInitialButtonText()}
          </Button>
        </div>
      )}

      {/* 폼 */}
      {hasInitialSent && (
        <Form {...form}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField
              control={form.control}
              name="verificationCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-zinc-300">인증 코드</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        {...field}
                        maxLength={6}
                        placeholder="인증 코드 6자리를 입력해주세요."
                        className="border-zinc-600 bg-zinc-700/50 pr-20 text-start text-sm tracking-widest text-white placeholder:text-zinc-400 focus:border-purple-400"
                        disabled={isLoading || isShowingSuccessState()}
                      />
                      {/* 타이머를 인풋 내부 오른쪽에 표시 */}
                      {isInCooldown() && (
                        <div className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center align-middle">
                          <span className="font-mono text-sm text-purple-400">{formatTimeMMSS(cooldownTime)}</span>
                        </div>
                      )}
                    </div>
                  </FormControl>
                  {/* 에러 상태일 때는 FormMessage 숨김 - 커스텀 에러 표시 사용 */}
                  {!shouldShowErrorMessage() && <FormMessage />}
                </FormItem>
              )}
            />
            {/* 재전송 버튼 - 타이머가 0일 때만 표시 */}
            {shouldShowTimerAndResend() && !isInCooldown() && (
              <div className="space-y-3 text-center">
                <p className="text-sm text-zinc-400">
                  <span className="inline-block text-purple-400">인증 코드를 받지 못하셨나요?</span>
                </p>
                <Button
                  type="button"
                  variant={!canResend ? "ghost" : "default"}
                  onClick={resendVerificationCode}
                  disabled={!canResend}
                  className="h-auto w-full p-0 px-3 py-1 hover:bg-zinc-700/50 hover:text-purple-400 disabled:text-zinc-500">
                  <span className="flex items-center gap-2">
                    {shouldShowSpinner() && (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-purple-400 border-t-transparent" />
                    )}
                    {getResendButtonText()}
                  </span>
                </Button>
              </div>
            )}

            {/* 에러 메시지 표시 */}
            {shouldShowErrorMessage() && (
              <StatusMessage variant="error" message={getErrorMessage()}>
                {canRetryError && (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={clearError}
                    className="h-auto p-0 px-3 py-1 text-sm text-zinc-400 hover:bg-zinc-700/50 hover:text-purple-300">
                    다시 시도
                  </Button>
                )}
              </StatusMessage>
            )}
            {/* 상태 표시 */}
            {isShowingProcessingStatus() && (
              <div className="text-center">
                <div className="flex items-center justify-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-purple-400 border-t-transparent" />
                  <p className="text-sm text-purple-400">{getProcessingStatusText()}</p>
                </div>
              </div>
            )}

            {/* 인증 성공 메시지 및 다음 버튼 */}
            {isShowingSuccessState() && (
              <div className="space-y-4 text-center">
                <StatusMessage variant="success" message={getSuccessMessage()} />
                <Button
                  type="submit"
                  disabled={!isCodeComplete || isVerifying}
                  onClick={proceedToNextStep}
                  variant={!isCodeComplete || isVerifying ? "ghost" : "default"}
                  className="h-12 w-full bg-purple-600 text-white hover:bg-purple-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-zinc-900">
                  다음
                </Button>
              </div>
            )}

            {/* 제출 버튼 (자동 검증이므로 숨김 처리, 폼 구조 유지용) */}
            <Button
              type="submit"
              disabled={!isCodeComplete || isVerifying}
              className="sr-only h-12 w-full bg-zinc-700 text-white hover:bg-zinc-600 disabled:bg-zinc-800 disabled:text-zinc-500">
              인증 완료
            </Button>
          </form>
        </Form>
      )}

      {/* 도움말 */}
      <div className="border-t border-zinc-700 pt-4 text-center">
        <p className="text-xs text-zinc-500">
          <span className="text-zinc-400">메일이 오지 않으면 스팸함을 확인해보세요</span>
        </p>
      </div>
    </>
  )
}

export default VerificationStep
