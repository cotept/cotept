"use client"

import { Button } from "@repo/shared/components/button"
import { Form, FormControl, FormField, FormItem, FormLabel } from "@repo/shared/components/form"
import { Input } from "@repo/shared/components/input"
import { ValidationIndicator } from "@repo/shared/components/validation-indicator"

import { CheckCircle, Clock, Copy, ExternalLink } from "lucide-react"

import type { BaekjoonVerifyStepData } from "@/features/onboarding/lib/validations/onboarding-rules"

import { useBaekjoonVerification } from "@/features/onboarding/hooks/useBaekjoonVerification"
import { InlineLoading } from "@/shared/ui/loading"

export interface BaekjoonVerifyStepProps {
  onComplete: (data: BaekjoonVerifyStepData) => void
}

export function BaekjoonVerifyStep({ onComplete }: BaekjoonVerifyStepProps) {
  const {
    form,
    validationChecks,
    verificationString,
    errorReason,
    formattedTime,
    remainingAttempts,
    isExpired,
    isVerifying,
    isCompleted,
    isFailed,
    isPending,
    handleSubmit,
    handleCopyCode,
    handleOpenSolvedAc,
    handleCompleteVerification,
    handleRetry,
    handleSkip,
    isStarting,
    isCompleting,
    canSkip,
  } = useBaekjoonVerification({ onComplete })

  // Phase 1: 백준 아이디 입력 화면
  if (isPending && !isVerifying && !isCompleted && !isFailed && !isExpired) {
    return (
      <Form {...form}>
        <form onSubmit={handleSubmit} className="flex flex-col items-center space-y-6">
          <FormField
            control={form.control}
            name="baekjoonHandle"
            render={({ field, formState }) => (
              <FormItem className="w-full">
                <FormLabel>백준 아이디 *</FormLabel>
                <FormControl>
                  <Input placeholder="백준 아이디를 입력하세요" {...field} className="bg-zinc-800" />
                </FormControl>
                <div className="pt-2">
                  <ValidationIndicator
                    checks={validationChecks}
                    isDirty={formState.dirtyFields.baekjoonHandle}
                    variant="compact"
                    size="sm"
                  />
                </div>
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full bg-purple-600 text-white hover:bg-purple-700" disabled={isStarting}>
            {isStarting ? (
              <>
                <InlineLoading className="mr-2" />
                시작 중...
              </>
            ) : (
              "인증 시작"
            )}
          </Button>

          {canSkip && (
            <Button type="button" variant="ghost" onClick={handleSkip} className="w-full">
              건너뛰기
            </Button>
          )}
        </form>
      </Form>
    )
  }

  // Phase 2: 인증 코드 발급 화면
  if (isVerifying && !isCompleted) {
    return (
      <div className="flex flex-col items-center space-y-6">
        {/* 안내 메시지 */}
        <div className="w-full space-y-2 text-center">
          <h3 className="text-lg font-semibold">백준 아이디 인증 진행</h3>
          <p className="text-muted-foreground text-sm">solved.ac 프로필 이름을 아래 문자열로 변경해주세요</p>
        </div>

        {/* 인증 코드 카드 */}
        <div className="border-border bg-card w-full space-y-4 rounded-lg border p-6">
          {/* 인증 코드 표시 */}
          <div className="rounded-lg bg-zinc-800 p-4 text-center">
            <p className="break-all font-mono text-lg text-purple-400">{verificationString}</p>
          </div>

          {/* 액션 버튼들 */}
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" onClick={handleCopyCode} className="w-full">
              <Copy className="mr-2 h-4 w-4" />
              복사하기
            </Button>
            <Button variant="outline" onClick={handleOpenSolvedAc} className="w-full">
              <ExternalLink className="mr-2 h-4 w-4" />
              solved.ac 열기
            </Button>
          </div>

          {/* 타이머 & 시도 횟수 */}
          <div className="border-border text-muted-foreground flex items-center justify-between border-t pt-2 text-sm">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>{formattedTime}</span>
            </div>
            <div>
              남은 시도: <span className="font-medium">{remainingAttempts}회</span>
            </div>
          </div>
        </div>

        {/* 안내 텍스트 */}
        <p className="text-muted-foreground text-center text-xs">프로필 변경 후 아래 버튼을 클릭해주세요</p>

        {/* 인증 완료 버튼 */}
        <Button
          className="w-full bg-purple-600 text-white hover:bg-purple-700"
          onClick={handleCompleteVerification}
          disabled={isCompleting}>
          {isCompleting ? (
            <>
              <InlineLoading className="mr-2" />
              확인 중...
            </>
          ) : (
            "인증 완료"
          )}
        </Button>
      </div>
    )
  }

  // Phase 3: 성공 상태
  if (isCompleted) {
    return (
      <div className="flex flex-col items-center space-y-6">
        <CheckCircle className="h-16 w-16 text-green-500" />
        <div className="space-y-2 text-center">
          <h3 className="text-lg font-semibold">인증 완료!</h3>
          <p className="text-muted-foreground text-sm">백준 아이디가 성공적으로 인증되었습니다</p>
        </div>
      </div>
    )
  }

  // Phase 4: 실패/만료 상태
  if (isFailed || isExpired) {
    return (
      <div className="flex flex-col items-center space-y-6">
        <div className="border-destructive bg-destructive/10 w-full rounded-lg border p-4 text-center">
          <p className="text-destructive text-sm">{errorReason || "인증 시간이 만료되었습니다"}</p>
        </div>
        <Button onClick={handleRetry} variant="outline" className="w-full">
          다시 시도
        </Button>
      </div>
    )
  }

  // Fallback (should not reach here)
  return null
}
