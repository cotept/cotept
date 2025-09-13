/**
 * @fileoverview 회원가입 2단계: 비밀번호 설정 훅
 * @description 비밀번호 입력, 확인, 강도 측정 로직
 */

"use client"

import { useMemo, useState } from "react"

import { ValidationCheck } from "@repo/shared/src/components/validation-indicator"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import { PasswordStepBaseRules, type PasswordStepData, PasswordStepRules } from "../../lib/validations/auth-rules"

interface UsePasswordStepProps {
  onComplete: (data: PasswordStepData) => void
}

export const usePasswordStep = ({ onComplete }: UsePasswordStepProps) => {
  const [showPassword, setShowPassword] = useState<boolean>(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false)

  const form = useForm<PasswordStepData>({
    resolver: zodResolver(PasswordStepRules),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  })

  // 실시간 비밀번호 감시
  const password = form.watch("password")
  const confirmPassword = form.watch("confirmPassword")

  const passwordChecks = useMemo(() => {
    if (!password) {
      return { lengthValid: false, compositionValid: false }
    }

    const passwordOnlyCheckResult = PasswordStepBaseRules.pick({ password: true }).safeParse({ password })

    if (passwordOnlyCheckResult.success) {
      return { lengthValid: true, compositionValid: true }
    }

    const _error = passwordOnlyCheckResult.error.flatten().fieldErrors.password || []

    const lengthValid = !_error.some((error) => error.includes("8자 이상") || error.includes("32자 이하"))
    const compositionValid = !_error.some((error) => error.includes("영문, 숫자, 특수문자를 모두 포함해야 합니다"))

    return {
      lengthValid,
      compositionValid,
    }
  }, [password])

  // ValidationIndicator용 체크 배열 생성
  const validationChecks: ValidationCheck[] = useMemo(
    () => [
      {
        id: "length",
        label: "8자 이상 32자 이하",
        isValid: passwordChecks.lengthValid,
      },
      {
        id: "composition",
        label: "영문, 숫자, 특수문자 포함",
        isValid: passwordChecks.compositionValid,
      },
    ],
    [passwordChecks],
  )

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev)
  }
  const passwordsMatch = useMemo(() => {
    return password && confirmPassword && password === confirmPassword
  }, [password, confirmPassword])

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword((prev) => !prev)
  }

  const handleSubmit = form.handleSubmit((data) => {
    onComplete(data)
  })

  return {
    form,
    password,
    handleSubmit,
    passwordChecks,
    showPassword,
    togglePasswordVisibility,
    showConfirmPassword,
    toggleConfirmPasswordVisibility,
    passwordsMatch,
    validationChecks,
  }
}
