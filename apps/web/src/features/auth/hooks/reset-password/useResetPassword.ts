"use client"

import { useCallback, useEffect, useState } from "react"

import { AuthType } from "@repo/api-client"
import {
  getPasswordCheckItems,
  isPasswordValid as checkPasswordValid,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  PASSWORD_SPECIAL_CHARS_REGEX,
} from "@repo/common-lib"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, useWatch } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import { useResetPassword as useResetPasswordMutation, useSendVerificationCode } from "../../apis/mutations"

// ============================================================================
// Schema & Types (공유 상수 사용)
// ============================================================================

const resetPasswordSchema = z
  .object({
    email: z.string().email("유효한 이메일을 입력해주세요."),
    verificationCode: z.string().length(6, "인증 코드는 6자리입니다."),
    newPassword: z
      .string()
      .min(PASSWORD_MIN_LENGTH, `${PASSWORD_MIN_LENGTH}자 이상 입력해주세요.`)
      .max(PASSWORD_MAX_LENGTH, `${PASSWORD_MAX_LENGTH}자 이하로 입력해주세요.`)
      .regex(/[a-z]/, "소문자를 포함해주세요.")
      .regex(/\d/, "숫자를 포함해주세요.")
      .regex(PASSWORD_SPECIAL_CHARS_REGEX, "특수문자를 포함해주세요."),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "비밀번호가 일치하지 않습니다.",
    path: ["confirmPassword"],
  })

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>
type ResetPasswordStep = "email" | "code" | "password" | "result"

interface ResetPasswordState {
  step: ResetPasswordStep
  verificationId: string
  cooldownTime: number
}

interface UseResetPasswordProps {
  onSuccess?: () => void
}

// ============================================================================
// Constants
// ============================================================================

const COOLDOWN_TIME = 180 // 3분

// ============================================================================
// Main Hook
// ============================================================================

export function useResetPassword({ onSuccess }: UseResetPasswordProps = {}) {
  // ===== 통합 상태 =====
  const [state, setState] = useState<ResetPasswordState>({
    step: "email",
    verificationId: "",
    cooldownTime: 0,
  })

  // ===== Form =====
  const form = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: "",
      verificationCode: "",
      newPassword: "",
      confirmPassword: "",
    },
    mode: "onChange",
  })

  const email = useWatch({ control: form.control, name: "email", defaultValue: "" })
  const newPassword = useWatch({ control: form.control, name: "newPassword", defaultValue: "" })
  const confirmPassword = useWatch({ control: form.control, name: "confirmPassword", defaultValue: "" })

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

  const resetPasswordMutation = useResetPasswordMutation({
    onSuccess: (response) => {
      if (response.data?.success) {
        setState((prev) => ({ ...prev, step: "result" }))
        toast.success("비밀번호가 변경되었습니다.")
        onSuccess?.()
      } else {
        toast.error(response.message || "비밀번호 변경에 실패했습니다.")
      }
    },
    onError: (error) => {
      toast.error(error?.message || "비밀번호 변경에 실패했습니다.")
    },
  })

  // ===== Handlers =====

  // Step 1: 이메일 입력 → 코드 발송
  const handleSendCode = useCallback(() => {
    const currentEmail = form.getValues("email")

    if (!currentEmail) {
      toast.error("이메일을 입력해주세요.")
      return
    }

    const emailValidation = z.string().email().safeParse(currentEmail)
    if (!emailValidation.success) {
      toast.error("올바른 이메일 형식을 입력해주세요.")
      return
    }

    sendCodeMutation.mutate({
      sendVerificationCodeRequestDto: {
        authType: AuthType.EMAIL,
        target: currentEmail,
      },
    })
  }, [form, sendCodeMutation])

  // Step 2: 인증 코드 확인 → 비밀번호 입력 단계로 이동
  const handleVerifyCode = useCallback(() => {
    const code = form.getValues("verificationCode")

    if (!state.verificationId) {
      toast.error("인증 코드를 먼저 발송해주세요.")
      return
    }

    if (code.length !== 6) {
      toast.error("인증 코드 6자리를 입력해주세요.")
      return
    }

    // 인증 코드 확인 성공 시 비밀번호 입력 단계로 이동
    setState((prev) => ({ ...prev, step: "password" }))
  }, [form, state.verificationId])

  // Step 3: 비밀번호 변경
  const handleResetPassword = useCallback(() => {
    const data = form.getValues()

    // 비밀번호 유효성 검사
    const passwordValidation = resetPasswordSchema.safeParse(data)
    if (!passwordValidation.success) {
      const firstError = passwordValidation.error.errors[0]
      toast.error(firstError?.message || "입력 정보를 확인해주세요.")
      return
    }

    if (!state.verificationId) {
      toast.error("인증이 필요합니다. 처음부터 다시 시도해주세요.")
      setState((prev) => ({ ...prev, step: "email" }))
      return
    }

    resetPasswordMutation.mutate({
      resetPasswordRequestDto: {
        email: data.email,
        verificationId: state.verificationId,
        verificationCode: data.verificationCode,
        newPassword: data.newPassword,
      },
    })
  }, [form, state.verificationId, resetPasswordMutation])

  // 재발송
  const handleResendCode = useCallback(() => {
    if (state.cooldownTime > 0) {
      toast.error(`${Math.floor(state.cooldownTime / 60)}분 ${state.cooldownTime % 60}초 후에 재발송할 수 있습니다.`)
      return
    }

    form.setValue("verificationCode", "")
    setState((prev) => ({ ...prev, verificationId: "" }))
    handleSendCode()
  }, [state.cooldownTime, form, handleSendCode])

  // 뒤로가기
  const goBack = useCallback(() => {
    if (state.step === "code") {
      setState((prev) => ({
        ...prev,
        step: "email",
        cooldownTime: 0,
        verificationId: "",
      }))
      form.setValue("verificationCode", "")
    } else if (state.step === "password") {
      setState((prev) => ({ ...prev, step: "code" }))
    }
  }, [state.step, form])

  // 초기화
  const resetFlow = useCallback(() => {
    setState({
      step: "email",
      verificationId: "",
      cooldownTime: 0,
    })
    form.reset()
  }, [form])

  // ===== 비밀번호 유효성 검사 (ValidationIndicator용) - 공유 모듈 사용 =====
  const passwordChecks = getPasswordCheckItems(newPassword)
  const isPasswordValid = checkPasswordValid(newPassword)
  const isPasswordMatch = newPassword === confirmPassword && confirmPassword.length > 0

  // ===== Return =====
  return {
    // 상태
    step: state.step,
    cooldownTime: state.cooldownTime,
    email,
    newPassword,
    confirmPassword,

    // Form
    form,

    // Handlers
    handleSendCode,
    handleVerifyCode,
    handleResetPassword,
    handleResendCode,
    goBack,
    resetFlow,

    // Loading
    isSendingCode: sendCodeMutation.isPending,
    isResetting: resetPasswordMutation.isPending,
    isLoading: sendCodeMutation.isPending || resetPasswordMutation.isPending,

    // Utils
    canResend: state.cooldownTime === 0,

    // 비밀번호 유효성
    passwordChecks,
    isPasswordValid,
    isPasswordMatch,
  }
}
