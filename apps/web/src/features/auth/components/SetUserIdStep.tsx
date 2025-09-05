"use client"

import React from "react"

import { Button } from "@repo/shared/src/components/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@repo/shared/src/components/form"
import { Input } from "@repo/shared/src/components/input"
import { StatusMessage } from "@repo/shared/src/components/status-message"
import { ValidationIndicator } from "@repo/shared/src/components/validation-indicator"

import { useSetUserId } from "@/features/auth/hooks/signup/useSetUserId"
import { SetUserIdData } from "@/features/auth/lib/validations/auth-rules"

interface SetUserIdStepProps {
  onComplete: (data: SetUserIdData) => void
}

const SetUserIdStep = ({ onComplete }: SetUserIdStepProps) => {
  const {
    form,
    handleCheckUserId,
    handleSubmit,

    // 상태
    phase,
    isUserIdVerified,
    hasError,
    userId,
    // ValidationIndicator 관련 (비즈니스 로직에서 가져옴)
    validationChecks,
    shouldShowValidationIndicator,
    isDirty,

    // UI 상태 헬퍼
    canCheckUserId,
    showCheckingSpinner,

    // 버튼 텍스트 헬퍼
    checkButtonText,
  } = useSetUserId({
    onComplete,
  })

  const shouldShowCheckButton = () => phase === "initial" || phase === "error"
  const shouldShowErrorState = () => hasError
  const shouldShowSuccessState = () => isUserIdVerified

  return (
    <>
      {/* 폼 */}
      <Form {...form}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField
            control={form.control}
            name="userId"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-zinc-300">아이디</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="text"
                    placeholder="아이디를 입력해주세요"
                    disabled={isUserIdVerified}
                    className="border-zinc-600 bg-zinc-700/50 text-sm text-white placeholder:text-zinc-400 focus:border-purple-400"
                  />
                </FormControl>
                <FormMessage />

                {/* 글자 수 카운터 - 다른 auth 스텝과 일관성 유지 */}
                <div className="mt-1 flex items-center justify-between">
                  <p className="text-xs text-zinc-500">영문, 숫자 조합</p>
                  <p className="text-xs text-zinc-500">{field.value.length}/20</p>
                </div>
              </FormItem>
            )}
          />

          {/* 아이디 조건 표시 - 검증 완료 시 숨김, isDirty 기반 부드러운 색상 전환 */}
          {shouldShowValidationIndicator && (
            <ValidationIndicator checks={validationChecks} showWhen="always" inputValue={userId} isDirty={isDirty} />
          )}

          {/* 중복 확인 버튼 */}
          {shouldShowCheckButton() && (
            <Button
              type="button"
              variant={canCheckUserId ? "auth-secondary" : "ghost"}
              size="xl"
              onClick={handleCheckUserId}
              disabled={!canCheckUserId}
              className="w-full">
              {showCheckingSpinner && (
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              )}
              {checkButtonText}
            </Button>
          )}

          {/* 성공 메시지 및 다음 버튼 */}
          {shouldShowSuccessState() && (
            <div className="space-y-4">
              <StatusMessage variant="success" message="사용 가능한 아이디입니다!" />
              <Button type="submit" variant="auth-primary" size="xl" onClick={handleSubmit} className="w-full">
                다음
              </Button>
            </div>
          )}

          {/* 에러 상태 표시 */}
          {shouldShowErrorState() && <StatusMessage variant="error" message="이미 사용 중인 아이디입니다." />}
        </form>
      </Form>
    </>
  )
}

export default SetUserIdStep
