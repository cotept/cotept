/**
 * @fileoverview 회원가입 2단계: 비밀번호 설정 훅
 * @description 비밀번호 입력, 확인, 강도 측정 로직
 */

"use client"

import { useMemo, useState } from "react"

import { ValidationCheck } from "@repo/shared/components/validation-indicator"
import { createValidationChecks, validateField } from "@repo/shared/src/rules/rule-helper"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, useWatch } from "react-hook-form"

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
    mode: "onChange",
  })

  // 실시간 비밀번호 감시
  const password = useWatch({ control: form.control, name: "password", defaultValue: "" })
  const confirmPassword = useWatch({ control: form.control, name: "confirmPassword", defaultValue: "" })

  // 비밀번호 검증 결과 (배열 + 객체 형태 동시 생성)
  const { validationChecks, passwordChecks } = useMemo(() => {
    if (!password) {
      const checks = [
        { id: "length", label: "8자 이상 32자 이하", isValid: false },
        { id: "composition", label: "영문, 숫자, 특수문자 포함", isValid: false },
      ] as const

      return {
        validationChecks: checks as unknown as ValidationCheck[],
        passwordChecks: { lengthValid: false, compositionValid: false },
      }
    }

    const fieldValidation = validateField(PasswordStepBaseRules.shape.password, password)
    const checks = createValidationChecks(fieldValidation, [
      {
        id: "length",
        label: "8자 이상 32자 이하",
        isIssuePresent: (issues) => issues.some((i) => i.code === "too_small" || i.code === "too_big"),
      },
      {
        id: "composition",
        label: "영문, 숫자, 특수문자 포함",
        isIssuePresent: (issues) => issues.some((i) => i.path.includes("composition")),
      },
    ])

    return {
      validationChecks: checks,
      passwordChecks: {
        lengthValid: checks[0].isValid,
        compositionValid: checks[1].isValid,
      },
    }
  }, [password])

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
