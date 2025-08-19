/**
 * @fileoverview 회원가입 1단계: 이메일 입력 훅
 * @description 이메일 검증 및 중복 확인 로직
 */

"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import { type EmailStepData, EmailStepRules } from "../../lib/validations/auth-rules"

// TODO: API 연동 시 실제 mutation으로 교체
const useCheckEmailMutation = () => {
  const mutate = (
    email: string,
    options: { onSuccess: (response: { data: { result: boolean; message: string } }) => void },
  ) => {
    // 임시: 모든 이메일 통과 처리
    setTimeout(() => {
      options.onSuccess({ data: { result: true, message: "사용 가능한 이메일입니다." } })
    }, 300)
  }

  return { mutate, isLoading: false }
}

interface UseEmailStepProps {
  onComplete: (data: EmailStepData) => void
}

/**
 * 이메일 입력 단계 훅
 *
 * @param onComplete - 단계 완료 시 콜백
 * @returns form 객체와 제출 핸들러
 */
export function useEmailStep({ onComplete }: UseEmailStepProps) {
  const form = useForm<EmailStepData>({
    resolver: zodResolver(EmailStepRules),
    defaultValues: {
      email: "",
    },
  })

  const { mutate: checkEmail, isLoading } = useCheckEmailMutation()

  const handleSubmit = form.handleSubmit(async (data) => {
    // 이메일 중복 확인
    checkEmail(data.email, {
      onSuccess: (result) => {
        if (result.data.result) {
          onComplete(data)
        } else {
          form.setError("email", {
            message: result.data.message || "이미 사용 중인 이메일입니다",
          })
        }
      },
    })
  })

  const email = form.watch("email")
  const isEmailValid = EmailStepRules.safeParse({ email }).success

  return {
    form,
    handleSubmit,
    isLoading,
    email,
    isEmailValid,
  }
}
