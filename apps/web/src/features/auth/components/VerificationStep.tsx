"use client"

import React, { useEffect } from "react"

import { Button } from "@repo/shared/src/components/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@repo/shared/src/components/form"
import { Input } from "@repo/shared/src/components/input"

import { useVerificationStep } from "@/features/auth/hooks/signup/useVerificationStep"
import { VerificationStepData } from "@/features/auth/lib/validations/auth-rules"

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
    isSending,
    isVerifying,
    cooldownTime,
    canResend,
    isCodeComplete,
  } = useVerificationStep({ email, onComplete })

  // 컴포넌트 마운트 시 자동으로 인증 코드 발송
  useEffect(() => {
    sendVerificationCode()
  }, [sendVerificationCode])

  // 시간 포맷팅 함수 (MM:SS)
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  return (
    <div className="w-full max-w-md mx-auto">
      {/* 상단 로고 영역 */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-6">
          COTEPT
        </h1>
      </div>

      {/* 메인 카드 */}
      <div className="bg-zinc-800/50 rounded-xl p-8 space-y-6 border border-zinc-700/50">
        {/* 제목 */}
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-white">이메일 인증</h2>
          <p className="text-sm text-zinc-400">
            <span className="text-purple-400">{email}</span>로 전송된
            <br />
            인증 코드 6자리를 입력해주세요
          </p>
        </div>

        {/* 폼 */}
        <Form {...form}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField
              control={form.control}
              name="verificationCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-zinc-300">인증 코드</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      maxLength={6}
                      placeholder="인증 코드 6자리를 입력해주세요."
                      className="bg-zinc-700/50 border-zinc-600 text-white placeholder:text-zinc-400 focus:border-purple-400 text-center text-2xl tracking-widest font-mono"
                      disabled={isVerifying}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 타이머 및 재전송 */}
            <div className="text-center space-y-3">
              {cooldownTime > 0 ? (
                <p className="text-sm text-zinc-400">
                  남은 시간: <span className="text-purple-400 font-mono">{formatTime(cooldownTime)}</span>
                </p>
              ) : (
                <p className="text-sm text-zinc-400">인증 코드를 받지 못하셨나요?</p>
              )}

              {/* 재전송 버튼 */}
              <Button
                type="button"
                variant="ghost"
                onClick={resendVerificationCode}
                disabled={!canResend || isSending}
                className="text-purple-400 hover:text-purple-300 hover:bg-zinc-700/50 p-0 h-auto">
                {isSending ? "전송 중..." : canResend ? "재전송" : `재전송 (${cooldownTime}초 후)`}
              </Button>
            </div>

            {/* 상태 표시 */}
            {isVerifying && (
              <div className="text-center">
                <p className="text-sm text-purple-400">인증 중...</p>
              </div>
            )}

            {/* 제출 버튼 (자동 검증이므로 숨김 처리, 폼 구조 유지용) */}
            <Button
              type="submit"
              disabled={!isCodeComplete || isVerifying}
              className="w-full bg-zinc-700 hover:bg-zinc-600 text-white disabled:bg-zinc-800 disabled:text-zinc-500 h-12 sr-only">
              인증 완료
            </Button>
          </form>
        </Form>

        {/* 도움말 */}
        <div className="text-center pt-4 border-t border-zinc-700">
          <p className="text-xs text-zinc-500">인증 코드를 입력하면 자동으로 확인됩니다</p>
        </div>
      </div>
    </div>
  )
}

export default VerificationStep
