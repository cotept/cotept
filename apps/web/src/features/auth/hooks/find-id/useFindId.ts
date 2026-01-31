"use client"

import { useCallback, useEffect, useState } from "react"

import { AuthType } from "@repo/api-client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, useWatch } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import { useFindId as useFindIdMutation, useSendVerificationCode } from "../../apis/mutations"

// ============================================================================
// Schema & Types
// ============================================================================

const findIdSchema = z.object({
  // authType: z.enum(["EMAIL", "PHONE"]),
  authType: z.enum(["EMAIL"]),
  target: z.string().min(1, "인증 정보를 입력해주세요."),
  verificationCode: z.string().length(6, "인증 코드는 6자리입니다."),
})

type FindIdFormData = z.infer<typeof findIdSchema>
type FindIdStep = "method" | "target" | "code" | "result"

interface FindIdState {
  step: FindIdStep
  verificationId: string
  maskedId: string
  cooldownTime: number
}

interface UseFindIdProps {
  onSuccess?: (maskedId: string) => void
}

// ============================================================================
// Constants
// ============================================================================

const COOLDOWN_TIME = 180 // 3분

// ============================================================================
// Main Hook
// ============================================================================

export function useFindId({ onSuccess }: UseFindIdProps = {}) {
  // ===== 통합 상태 =====
  const [state, setState] = useState<FindIdState>({
    step: "method",
    verificationId: "",
    maskedId: "",
    cooldownTime: 0,
  })

  // ===== Form =====
  const form = useForm<FindIdFormData>({
    resolver: zodResolver(findIdSchema),
    defaultValues: {
      authType: "EMAIL",
      target: "",
      verificationCode: "",
    },
  })

  const authType = useWatch({ control: form.control, name: "authType", defaultValue: "EMAIL" })
  const target = useWatch({ control: form.control, name: "target", defaultValue: "" })

  // ===== 타이머 =====
  useEffect(() => {
    if (state.cooldownTime > 0) {
      const timer = setTimeout(() => {
        setState((prev) => ({ ...prev, cooldownTime: prev.cooldownTime - 1 }))
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [state.cooldownTime])

  // ===== API Mutations =====
  const sendCodeMutation = useSendVerificationCode({
    onSuccess: (response) => {
      if (response.data?.verificationId) {
        setState((prev) => ({
          ...prev,
          verificationId: response.data!.verificationId!,
          cooldownTime: COOLDOWN_TIME,
          step: "code",
        }))
        toast.success("인증 코드가 발송되었습니다.")
      }
    },
    onError: (error) => {
      toast.error(error?.message || "인증 코드 발송에 실패했습니다.")
    },
  })

  const findIdMutation = useFindIdMutation({
    onSuccess: (response) => {
      if (response.data?.maskedId) {
        setState((prev) => ({
          ...prev,
          maskedId: response.data!.maskedId!,
          step: "result",
        }))
        toast.success("아이디를 찾았습니다.")
        onSuccess?.(response.data!.maskedId!)
      } else {
        toast.error(response.message || "등록된 아이디를 찾을 수 없습니다.")
        form.setValue("verificationCode", "")
      }
    },
    onError: (error) => {
      toast.error(error?.message || "아이디 찾기에 실패했습니다.")
      form.setValue("verificationCode", "")
    },
  })

  // ===== Handlers =====

  const handleMethodSubmit = useCallback(() => {
    setState((prev) => ({ ...prev, step: "target" }))
  }, [])

  const handleSendCode = useCallback(() => {
    const currentTarget = form.getValues("target")
    const currentAuthType = form.getValues("authType") as AuthType

    if (!currentTarget) {
      toast.error("인증 정보를 입력해주세요.")
      return
    }

    sendCodeMutation.mutate({
      sendVerificationCodeRequestDto: {
        authType: currentAuthType,
        target: currentTarget,
      },
    })
  }, [form, sendCodeMutation])

  const handleFindId = useCallback(() => {
    const data = form.getValues()

    if (!state.verificationId) {
      toast.error("인증 코드를 먼저 발송해주세요.")
      return
    }

    findIdMutation.mutate({
      findIdRequestDto: {
        authType: data.authType as AuthType,
        target: data.target,
        verificationId: state.verificationId,
        verificationCode: data.verificationCode,
      },
    })
  }, [form, state.verificationId, findIdMutation])

  const handleResendCode = useCallback(() => {
    if (state.cooldownTime > 0) {
      toast.error(`${Math.floor(state.cooldownTime / 60)}분 ${state.cooldownTime % 60}초 후에 재발송할 수 있습니다.`)
      return
    }

    form.setValue("verificationCode", "")
    setState((prev) => ({ ...prev, verificationId: "" }))
    handleSendCode()
  }, [state.cooldownTime, form, handleSendCode])

  const goBack = useCallback(() => {
    if (state.step === "target") {
      setState((prev) => ({ ...prev, step: "method" }))
    } else if (state.step === "code") {
      setState((prev) => ({
        ...prev,
        step: "target",
        cooldownTime: 0,
        verificationId: "",
      }))
      form.setValue("verificationCode", "")
    }
  }, [state.step, form])

  const resetFlow = useCallback(() => {
    setState({
      step: "method",
      verificationId: "",
      maskedId: "",
      cooldownTime: 0,
    })
    form.reset()
  }, [form])

  // ===== Return =====
  return {
    // 상태
    step: state.step,
    maskedId: state.maskedId,
    cooldownTime: state.cooldownTime,
    authType,
    target,

    // Form
    form,

    // Handlers
    handleMethodSubmit,
    handleSendCode,
    handleFindId,
    handleResendCode,
    goBack,
    resetFlow,

    // Loading
    isSendingCode: sendCodeMutation.isPending,
    isFindingId: findIdMutation.isPending,
    isLoading: sendCodeMutation.isPending || findIdMutation.isPending,

    // Utils
    canResend: state.cooldownTime === 0,
  }
}
