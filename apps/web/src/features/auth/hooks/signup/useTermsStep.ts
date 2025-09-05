/**
 * @fileoverview 회원가입 2단계: 비밀번호 설정 훅
 * @description 비밀번호 입력, 확인, 강도 측정 로직
 */

"use client"

import { useMemo } from "react"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import { type TermsStepData, TermsStepRules } from "../../lib/validations/auth-rules"

interface UseTermsStepProps {
  onComplete: (data: TermsStepData) => void
}

export const useTermsStep = ({ onComplete }: UseTermsStepProps) => {
  const form = useForm<TermsStepData>({
    resolver: zodResolver(TermsStepRules),
    defaultValues: {
      serviceTerms: false,
      privacyPolicy: false,
      ageConfirmation: false,
      marketingConsent: false,
    },
  })

  // 실시간으로 모든 약관 상태 감시
  const watchedValues = form.watch()

  // 전체 동의 여부 계산 (실시간)
  const allAgreed = useMemo(() => {
    return (Object.entries(watchedValues) as [keyof TermsStepData, boolean][]).every(([, value]) => value === true)
  }, [watchedValues])

  // 전체 동의 토글 함수
  const toggleAllAgreements = () => {
    const newValue = !allAgreed

    // 모든 약관을 동일한 값으로 설정
    ;(Object.keys(watchedValues) as (keyof TermsStepData)[]).forEach((key) => {
      form.setValue(key, newValue)
    })
  }

  const handleSubmit = form.handleSubmit((data) => {
    onComplete(data)
  })

  return {
    form,
    handleSubmit,
    allAgreed,
    toggleAllAgreements,
  }
}
