/**
 * @fileoverview 회원가입 4단계: 이메일 인증 훅
 * @description 인증 코드 발송, 입력, 검증 로직
 */

"use client"

import { useCallback, useEffect, useState } from "react"

import { AuthType } from "@repo/api-client/src/types/auth-type"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import { useSendVerificationCode, useVerifyCode } from "../../apis/mutations"
import { type VerificationStepData, VerificationStepRules } from "../../lib/validations/auth-rules"

interface UseVerificationStepProps {
  email: string
  onComplete: (data: VerificationStepData) => void
}

/**
 * 이메일 인증 단계 훅
 *
 * @param email - 인증할 이메일 주소
 * @param onComplete - 단계 완료 시 콜백
 * @returns form 객체와 인증 관련 함수들
 */
export function useVerificationStep({ email, onComplete }: UseVerificationStepProps) {
  const [verificationId, setVerificationId] = useState<string>("")
  const [cooldownTime, setCooldownTime] = useState<number>(0)

  const form = useForm<VerificationStepData>({
    resolver: zodResolver(VerificationStepRules),
    defaultValues: {
      verificationCode: "",
    },
  })

  // API 훅들
  const { mutate: sendCode, isPending: isSending } = useSendVerificationCode({
    onSuccess: (response) => {
      // 실제 API 응답에서 verificationId 추출
      if (response.data?.verificationId) {
        setVerificationId(response.data?.verificationId || "")
        setCooldownTime(60) // 60초 쿨타임 시작
      } else {
        form.setError("verificationCode", {
          message: response.message || "인증 코드 전송을 실패 했습니다. 다시 시도해주세요.",
        })
      }
    },
    onError: (_error) => {
      form.setError("verificationCode", {
        message: _error.message || "인증 코드 발송에 실패했습니다. 다시 시도해주세요.",
      })
    },
  })

  const { mutate: verifyCode, isPending: isVerifying } = useVerifyCode({
    onSuccess: (_response) => {
      // 인증 성공 시 Zod 스키마로 데이터 검증 후 다음 단계로
      const validatedData = VerificationStepRules.safeParse(form.getValues())
      if (_response.data?.success && validatedData.success) {
        onComplete(validatedData.data)
      } else {
        form.setError("verificationCode", {
          message: _response.message || "인증 코드가 올바르지 않습니다. 다시 확인해주세요.",
        })
      }
    },
    onError: (_error) => {
      form.setError("verificationCode", {
        message: _error.message || "인증 코드가 올바르지 않습니다. 다시 확인해주세요.",
      })
      form.setValue("verificationCode", "") // 입력 필드 초기화
    },
  })

  // 인증 코드 실시간 감시 및 자동 검증
  const verificationCode = form.watch("verificationCode")

  useEffect(() => {
    // 6자리 완성 시 자동 검증
    if (verificationCode.length === 6 && verificationId) {
      verifyCode([
        {
          verifyCodeRequestDto: {
            verificationId,
            code: verificationCode,
          },
        },
      ])
    }
  }, [verificationCode, verificationId, verifyCode])

  // 쿨타임 타이머
  useEffect(() => {
    if (cooldownTime > 0) {
      const timer = setTimeout(() => {
        setCooldownTime(cooldownTime - 1)
      }, 1000)

      return () => clearTimeout(timer)
    }
  }, [cooldownTime])

  // 인증 코드 발송 함수
  const sendVerificationCode = useCallback(() => {
    if (cooldownTime > 0) return

    sendCode([
      {
        sendVerificationCodeRequestDto: {
          authType: AuthType.email,
          target: email,
        },
      },
    ])
  }, [email, cooldownTime, sendCode])

  // 인증 코드 재발송 함수
  const resendVerificationCode = useCallback(() => {
    if (cooldownTime > 0) return

    form.setValue("verificationCode", "") // 입력 필드 초기화
    sendVerificationCode()
  }, [cooldownTime, form, sendVerificationCode])

  const handleSubmit = form.handleSubmit((data) => {
    // 6자리가 완성되어 있으면서 verificationId가 있는 경우 수동 검증
    if (data.verificationCode.length === 6 && verificationId) {
      verifyCode([
        {
          verifyCodeRequestDto: {
            verificationId,
            code: data.verificationCode,
          },
        },
      ])
    }
  })

  return {
    form,
    handleSubmit,
    sendVerificationCode,
    resendVerificationCode,
    isSending,
    isVerifying,
    cooldownTime,
    canResend: cooldownTime === 0,
    isCodeComplete: verificationCode.length === 6,
  }
}
