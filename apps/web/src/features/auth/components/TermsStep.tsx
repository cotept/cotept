"use client"

import React from "react"

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
  const termsData = [
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
  ]

  // 필수 약관이 모두 동의되었는지 확인
  const requiredTermsAgreed = termsData.filter((term) => term.required).every((term) => form.watch(term.name))

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
          <h2 className="text-xl font-semibold text-white">약관 동의</h2>
          <p className="text-sm text-zinc-400">서비스 이용을 위한 약관에 동의해주세요</p>
        </div>

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
                  className="data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
                />
                <label htmlFor="allAgreed" className="text-white font-semibold cursor-pointer">
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
                            className="data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
                          />
                        </FormControl>
                        <FormLabel className="text-zinc-300 cursor-pointer flex-1 flex items-center justify-between">
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
              className="w-full bg-zinc-700 hover:bg-zinc-600 text-white disabled:bg-zinc-800 disabled:text-zinc-500 h-12">
              다음
            </Button>
          </form>
        </Form>
      </div>
    </div>
  )
}

export default TermsStep
