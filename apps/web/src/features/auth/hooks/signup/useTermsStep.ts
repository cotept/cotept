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

// TODO(human):
//  약관 동의 단계 분석

//   TermsStepRules 구조:
//   - serviceTerms - 서비스 이용약관 (필수)
//   - privacyPolicy - 개인정보처리방침 (필수)
//   - ageConfirmation - 만 14세 이상 확인 (필수)
//   - marketingConsent - 마케팅 동의 (선택)

//   ● Learn by Doing

//   Context: 약관 동의 단계에서는 "전체 동의" 체크박스가 필요합니다. 전체 동의를 체크하면
//    모든 약관(필수+선택)이 체크되고, 개별 약관을 해제하면 전체 동의도 해제되는 로직이
//   필요합니다.

//   Your Task: apps/web/src/features/auth/hooks/useTermsStep.ts 파일을 새로 만들어서 약관
//    동의 단계 훅을 구현해주세요. TODO(human) 섹션을 찾아서 다음을 구현해주세요:

//   1. allAgreed 상태 - 전체 동의 여부 계산
//   2. toggleAllAgreements 함수 - 전체 동의/해제 토글
//   3. 개별 약관 상태 변경 시 전체 동의 상태 자동 업데이트

//   Guidance:
//   - form.watch()로 모든 약관 상태 실시간 감시
//   - 전체 동의 = 모든 필수 약관 + 마케팅 동의 모두 true
//   - 전체 동의 토글 시 모든 약관을 동일한 값으로 설정
//   - useMemo로 계산 최적화, 반환값에 allAgreed, toggleAllAgreements 포함

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
