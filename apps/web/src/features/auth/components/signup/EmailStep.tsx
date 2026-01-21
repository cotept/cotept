"use client"

import React from "react"

import { Button } from "@repo/shared/src/components/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@repo/shared/src/components/form"
import { Input } from "@repo/shared/src/components/input"
import { StatusMessage } from "@repo/shared/src/components/status-message"

import { useEmailStep } from "@/features/auth/hooks/signup/useEmailStep"
import { EmailStepData } from "@/features/auth/lib/validations/auth-rules"

interface EmailStepProps {
  onComplete: (data: EmailStepData) => void
}

const EmailStep: React.FC<EmailStepProps> = ({ onComplete }) => {
  const {
    form,
    handleCheckEmail,
    handleSubmit,

    // 상태
    phase,
    isEmailVerified,
    hasError,

    // UI 상태 헬퍼
    canCheckEmail,
    showCheckingSpinner,

    // 버튼 텍스트 헬퍼
    checkButtonText,
  } = useEmailStep({ onComplete })

  // 상태 체크 함수들
  const shouldShowCheckButton = () => phase === "initial" || phase === "error"
  const shouldShowErrorState = () => hasError
  const shouldShowSuccessState = () => isEmailVerified

  return (
    <>
      {/* 폼 */}
      <Form {...form}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-fg-2">이메일</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="email"
                    placeholder="이메일을 입력하세요"
                    disabled={isEmailVerified}
                    className="border-border bg-bg-4/50 text-foreground placeholder:text-muted-foreground focus:border-ring"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* 중복 확인 버튼 */}
          {shouldShowCheckButton() && (
            <Button
              type="button"
              variant={canCheckEmail ? "default" : "ghost"}
              size="xl"
              onClick={handleCheckEmail}
              disabled={!canCheckEmail}
              className="w-full">
              {showCheckingSpinner && (
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              )}
              {checkButtonText}
            </Button>
          )}

          {/* 성공 메시지 및 다음 버튼 */}
          {shouldShowSuccessState() && (
            <div className="space-y-4">
              <StatusMessage variant="success" message="사용 가능한 이메일입니다!" />
              <Button type="submit" variant="auth-primary" size="xl" onClick={handleSubmit} className="w-full">
                다음
              </Button>
            </div>
          )}

          {/* 에러 상태 표시 */}
          {shouldShowErrorState() && <StatusMessage variant="error" message="이미 사용 중인 이메일입니다." />}
        </form>
      </Form>
    </>
  )
}

export default EmailStep
