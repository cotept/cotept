"use client"

import React, { useMemo } from "react"

import { Button } from "@repo/shared/src/components/button"
import { Checkbox } from "@repo/shared/src/components/checkbox"
import { Form, FormControl, FormField, FormItem, FormLabel } from "@repo/shared/src/components/form"

import { useTermsStep } from "@/features/auth/hooks/signup/useTermsStep"
import { TermsStepData } from "@/features/auth/lib/validations/auth-rules"

interface TermsStepProps {
  onComplete: (data: TermsStepData) => void
}

const TermsStep: React.FC<TermsStepProps> = ({ onComplete }) => {
  const { form, handleSubmit, allAgreed, toggleAllAgreements } = useTermsStep({ onComplete })

  // 약관 정보 배열
  const termsData = useMemo(
    () => [
      {
        name: "serviceTerms" as const,
        label: "서비스 이용약관 동의",
        required: true,
      },
      {
        name: "privacyPolicy" as const,
        label: "개인정보처리방침 동의",
        required: true,
      },
      {
        name: "ageConfirmation" as const,
        label: "만 14세 이상입니다",
        required: true,
      },
      {
        name: "marketingConsent" as const,
        label: "마케팅 수신 동의",
        required: false,
      },
    ],
    [],
  )

  // 필수 약관이 모두 동의되었는지 확인
  const requiredTermsAgreed = termsData.filter((term) => term.required).every((term) => form.watch(term.name))

  return (
    <>
      {/* 폼 */}
      <Form {...form}>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 전체 동의 체크박스 */}
          <div className="border-b border-zinc-700 pb-4">
            <div className="flex items-center space-x-3">
              <Checkbox
                id="allAgreed"
                checked={allAgreed}
                onCheckedChange={toggleAllAgreements}
                className="data-[state=checked]:border-purple-600 data-[state=checked]:bg-purple-600"
              />
              <label htmlFor="allAgreed" className="cursor-pointer font-semibold text-white">
                전체 동의
              </label>
            </div>
          </div>

          {/* 개별 약관 체크박스들 */}
          <div className="space-y-4">
            {termsData.map((term) => (
              <FormField
                key={term.name}
                control={form.control}
                name={term.name}
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center space-x-3">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="data-[state=checked]:border-purple-600 data-[state=checked]:bg-purple-600"
                        />
                      </FormControl>
                      <FormLabel className="flex flex-1 cursor-pointer items-center justify-between text-zinc-300">
                        <span>{term.label}</span>
                        <span className={`text-xs ${term.required ? "text-red-400" : "text-zinc-500"}`}>
                          {term.required ? "(필수)" : "(선택)"}
                        </span>
                      </FormLabel>
                    </div>
                  </FormItem>
                )}
              />
            ))}
          </div>

          {/* 제출 버튼 */}
          <Button
            type="submit"
            disabled={!requiredTermsAgreed}
            variant={!requiredTermsAgreed ? "ghost" : "auth-primary"}
            size="xl"
            className="w-full">
            다음
          </Button>
        </form>
      </Form>
    </>
  )
}

export default TermsStep
