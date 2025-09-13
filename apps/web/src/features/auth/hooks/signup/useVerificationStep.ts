/**
 * @fileoverview 회원가입 4단계: 이메일 인증 훅 (간단한 버전)
 * @description 인증 코드 발송, 입력, 검증 로직 (useState 기반으로 단순화)
 */

"use client"

import { useCallback, useEffect, useState } from "react"

import { AuthType } from "@repo/api-client/src/types/auth-type"

import { zodResolver } from "@hookform/resolvers/zod"
import { produce } from "immer"
import { useForm } from "react-hook-form"

import { useSendVerificationCode, useVerifyCode } from "../../apis/mutations"
import { type VerificationStepData, VerificationStepRules } from "../../lib/validations/auth-rules"

// ===== 타입 정의 =====

interface UseVerificationStepProps {
  email: string
  onComplete: (data: VerificationStepData) => void
}

/** 인증 진행 단계 */
type VerificationPhase = "initial" | "sent" | "verifying" | "success" | "error"

/** 에러 정보 */
type ErrorInfo = {
  message: string
  canRetry: boolean
  shouldClearCode: boolean
}

/** 통합 상태 관리 */
type VerificationState = {
  phase: VerificationPhase
  verificationId: string
  cooldownTime: number
  error: ErrorInfo | null
}

// ===== 상수 =====

/** 인증 코드 유효 시간 (3분) */
const VERIFICATION_COOLDOWN_TIME = 180

// ===== 유틸 함수 =====

/** 인증 코드 유효성 검사 */
const isValidVerificationCode = (code: string): boolean => code.length === 6 && /^\d{6}$/.test(code)

/** 에러 메시지 분석하여 ErrorInfo 생성 */
const createErrorInfo = (error: any): ErrorInfo => {
  const message = error?.message || ""

  if (message.includes("인증 시간이 만료")) {
    return {
      message: "인증 시간이 만료되었습니다. 새로운 인증 코드를 요청해주세요.",
      canRetry: true,
      shouldClearCode: true,
    }
  }

  if (message.includes("시도 횟수를 초과")) {
    return {
      message: "인증 시도 횟수를 초과했습니다. 새로운 인증 코드를 요청해주세요.",
      canRetry: true,
      shouldClearCode: true,
    }
  }

  if (message.includes("유효하지 않은 인증")) {
    return {
      message: "인증 코드가 올바르지 않습니다. 다시 확인해주세요.",
      canRetry: true,
      shouldClearCode: true,
    }
  }

  return {
    message: message || "오류가 발생했습니다. 다시 시도해주세요.",
    canRetry: true,
    shouldClearCode: false,
  }
}

// ===== 메인 훅 =====

export function useVerificationStep({ email, onComplete }: UseVerificationStepProps) {
  // 통합 상태 관리
  const [state, setState] = useState<VerificationState>({
    phase: "initial",
    verificationId: "",
    cooldownTime: 0,
    error: null,
  })

  // Form 관리
  const form = useForm<VerificationStepData>({
    resolver: zodResolver(VerificationStepRules),
    defaultValues: {
      verificationCode: "",
    },
  })

  const code = form.watch("verificationCode")

  // API 호출 관리
  const { mutate: sendCode, isPending: isSending } = useSendVerificationCode({
    onSuccess: (response) => {
      if (response.data?.verificationId) {
        setState(
          produce((draft) => {
            draft.phase = "sent"
            draft.verificationId = response.data!.verificationId
            draft.cooldownTime = VERIFICATION_COOLDOWN_TIME
            draft.error = null
          }),
        )
      } else {
        setState(
          produce((draft) => {
            draft.phase = "error"
            draft.error = createErrorInfo({ message: response.message })
          }),
        )
      }
    },
    onError: (error) => {
      setState(
        produce((draft) => {
          draft.phase = "error"
          draft.error = createErrorInfo(error)
        }),
      )
    },
  })

  const { mutate: verifyCode, isPending: isVerifying } = useVerifyCode({
    onSuccess: (response) => {
      if (response.data?.success) {
        setState(
          produce((draft) => {
            draft.phase = "success"
            draft.error = null
          }),
        )
      } else {
        const errorInfo = createErrorInfo({ message: response.message })
        setState(
          produce((draft) => {
            draft.phase = "error"
            draft.error = errorInfo
          }),
        )
        if (errorInfo.shouldClearCode) {
          form.setValue("verificationCode", "")
        }
      }
    },
    onError: (error) => {
      const errorInfo = createErrorInfo(error)
      setState(
        produce((draft) => {
          draft.phase = "error"
          draft.error = errorInfo
        }),
      )
      if (errorInfo.shouldClearCode) {
        form.setValue("verificationCode", "")
      }
    },
  })

  // 타이머 관리
  useEffect(() => {
    if (state.cooldownTime > 0) {
      const timer = setTimeout(() => {
        setState(
          produce((draft) => {
            draft.cooldownTime = Math.max(0, draft.cooldownTime - 1)
          }),
        )
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [state.cooldownTime])

  // 자동 검증 로직 (기존 동작 유지)
  useEffect(() => {
    if (isValidVerificationCode(code) && state.verificationId !== "" && state.phase === "sent") {
      // sent 상태에서만 자동 검증 실행

      setState(
        produce((draft) => {
          draft.phase = "verifying"
        }),
      )
      verifyCode([
        {
          verifyCodeRequestDto: {
            verificationId: state.verificationId,
            code,
          },
        },
      ])
    }
  }, [code, state.verificationId, state.phase, verifyCode])

  // 에러 상태를 form에 반영
  useEffect(() => {
    if (state.phase === "error" && state.error) {
      form.setError("verificationCode", {
        message: state.error.message,
      })
    }
  }, [state.phase, state.error, form])

  // 이벤트 핸들러
  const sendVerificationCode = useCallback(() => {
    if (state.cooldownTime > 0 || isSending) return

    setState(
      produce((draft) => {
        draft.phase = "initial"
        draft.error = null
      }),
    )
    sendCode([
      {
        sendVerificationCodeRequestDto: {
          authType: AuthType.email,
          target: email,
        },
      },
    ])
  }, [state.cooldownTime, isSending, email, sendCode])

  const resendVerificationCode = useCallback(() => {
    if (state.cooldownTime > 0 || isSending) return

    form.setValue("verificationCode", "")
    form.clearErrors("verificationCode")
    setState(
      produce((draft) => {
        draft.phase = "initial"
        draft.verificationId = ""
        draft.cooldownTime = 0
        draft.error = null
      }),
    )
    sendVerificationCode()
  }, [state.cooldownTime, isSending, form, sendVerificationCode])

  const proceedToNextStep = useCallback(() => {
    const validatedData = VerificationStepRules.safeParse(form.getValues())
    if (state.phase === "success" && validatedData.success) {
      onComplete(validatedData.data)
    }
  }, [state.phase, form, onComplete])

  const handleSubmit = form.handleSubmit((data) => {
    if (isValidVerificationCode(data.verificationCode) && state.verificationId) {
      setState(
        produce((draft) => {
          draft.phase = "verifying"
        }),
      )
      verifyCode([
        {
          verifyCodeRequestDto: {
            verificationId: state.verificationId,
            code: data.verificationCode,
          },
        },
      ])
    }
  })

  const clearError = useCallback(() => {
    setState(
      produce((draft) => {
        draft.error = null
      }),
    )
    form.clearErrors("verificationCode")
  }, [form])

  // 계산된 상태들
  const canResend = state.cooldownTime === 0 && !isSending
  const isCodeComplete = isValidVerificationCode(code)
  const isLoading = isSending || isVerifying || state.phase === "verifying"

  // 공개 인터페이스 (기존과 동일하게 유지)
  return {
    form,
    handleSubmit,
    sendVerificationCode,
    resendVerificationCode,
    proceedToNextStep,
    clearError,

    // 상태
    phase: state.phase,
    cooldownTime: state.cooldownTime,
    canResend,
    isCodeComplete,
    isVerificationSuccess: state.phase === "success",
    isLoading,

    // 에러 정보
    error: state.error,
    hasError: state.phase === "error" && !!state.error,
    errorType: state.error ? "CUSTOM" : undefined,
    canRetryError: state.error?.canRetry ?? false,

    // 레거시 호환성 (컴포넌트에서 사용 중)
    isSending,
    isVerifying,
    isProcessing: state.phase === "verifying",
    isPendingVerification: state.phase === "verifying",
    hasInitialSent: state.phase !== "initial",
  }
}
