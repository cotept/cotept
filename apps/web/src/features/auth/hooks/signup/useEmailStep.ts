/**
 * @fileoverview 회원가입 1단계: 이메일 입력 훅
 * @description 이메일 검증 및 중복 확인 로직 (2단계 프로세스)
 */

"use client"

import { useCallback, useState } from "react"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import { type EmailStepData, EmailStepRules } from "../../lib/validations/auth-rules"

import { useCheckEmailAvailabilityMutation } from "@/features/auth/apis/mutations"

// ===== 1부: 타입 & 상수 정의 =====

interface UseEmailStepProps {
  onComplete: (data: EmailStepData) => void
}

/** 이메일 확인 단계 */
type EmailCheckPhase =
  | "initial" // 초기 상태
  | "checking" // 중복 확인 중
  | "verified" // 중복 확인 완료 (사용 가능)
  | "error" // 에러 발생

// ===== 2부: 순수 함수들 (Utils) =====

/** 이메일 유효성 검사 */
const isValidEmail = (email: string): boolean => EmailStepRules.safeParse({ email }).success

/** 중복 확인 가능 여부 */
const canCheckEmail = (isEmailValid: boolean, phase: EmailCheckPhase, isLoading: boolean): boolean => {
  return isEmailValid && phase !== "verified" && !isLoading
}

/** 다음 단계 진행 가능 여부 */
const canProceedNext = (phase: EmailCheckPhase): boolean => {
  return phase === "verified"
}

/** 로딩 스피너 표시 여부 */
const shouldShowCheckingSpinner = (phase: EmailCheckPhase, isLoading: boolean): boolean => {
  return phase === "checking" || isLoading
}

/** 버튼 텍스트 결정 */
const getCheckButtonText = (phase: EmailCheckPhase): string => {
  if (phase === "checking") {
    return "확인 중..."
  }
  if (phase === "verified") {
    return "확인 완료"
  }
  return "중복 확인"
}

// ===== 3부: 메인 훅 (Public API) =====

/**
 * 이메일 입력 단계 훅 (2단계 프로세스)
 * 1단계: 이메일 입력 → 중복 확인 버튼 클릭
 * 2단계: 중복 확인 성공 → 다음 버튼 클릭
 *
 * @param onComplete - 단계 완료 시 콜백
 * @returns 2단계 프로세스를 위한 상태와 핸들러들
 */
export function useEmailStep({ onComplete }: UseEmailStepProps) {
  const [phase, setPhase] = useState<EmailCheckPhase>("initial")

  const form = useForm<EmailStepData>({
    resolver: zodResolver(EmailStepRules),
    defaultValues: {
      email: "",
    },
  })

  const email = form.watch("email")
  const isEmailValid = isValidEmail(email)

  const checkEmailMutation = useCheckEmailAvailabilityMutation()
  // 1단계: 이메일 중복 확인
  const handleCheckEmail = useCallback(async () => {
    if (!isEmailValid) return

    setPhase("checking")
    form.clearErrors("email")

    try {
      const result = await checkEmailMutation.mutateAsync(email)
      if (result.data?.available) {
        setPhase("verified")
      } else {
        setPhase("error")
        form.setError("email", { message: "이미 사용 중인 이메일입니다" })
      }
    } catch {
      // 에러는 mutation의 onError에서 이미 처리됨
      setPhase("error")
    }
  }, [isEmailValid, checkEmailMutation, form, email])

  // 폼 제출 핸들러 (중복 확인 완료 후에만 실행)
  const handleSubmit = form.handleSubmit((data) => {
    if (phase === "verified") {
      onComplete(data)
    }
  })

  // 이메일 변경 시 상태 리셋
  const handleEmailChange = useCallback(() => {
    if (phase === "verified" || phase === "error") {
      setPhase("initial")
      form.clearErrors("email")
    }
  }, [phase, form])

  // 이메일 필드 변경 감지
  const [previousEmail, setPreviousEmail] = useState(email)

  if (email !== previousEmail) {
    setPreviousEmail(email)
    handleEmailChange()
  }

  return {
    form,
    handleCheckEmail,
    handleSubmit,

    // 상태
    phase,
    isLoading: checkEmailMutation.isPending,
    email,
    isEmailValid,
    isEmailVerified: phase === "verified",
    hasError: phase === "error",

    // UI 상태 헬퍼
    canCheckEmail: canCheckEmail(isEmailValid, phase, checkEmailMutation.isPending),
    canProceedNext: canProceedNext(phase),
    showCheckingSpinner: shouldShowCheckingSpinner(phase, checkEmailMutation.isPending),

    // 버튼 텍스트 헬퍼
    checkButtonText: getCheckButtonText(phase),
  }
}
