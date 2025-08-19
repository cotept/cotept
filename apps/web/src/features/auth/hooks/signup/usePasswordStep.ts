/**
 * @fileoverview 회원가입 2단계: 비밀번호 설정 훅
 * @description 비밀번호 입력, 확인, 강도 측정 로직
 */

"use client"

import { useMemo, useState } from "react"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import { PasswordStepBaseRules, type PasswordStepData, PasswordStepRules } from "../../lib/validations/auth-rules"

interface UsePasswordStepProps {
  onComplete: (data: PasswordStepData) => void
}

// TODO(human):
//  2줄 구성:
//   줄 1: 8자 이상 32자 이하
//   줄 2: 영문, 숫자, 특수문자 포함

//   조건 매핑:
//   - 길이 조건: 8자 이상 32자 이하 (length >= 8 && length <= 32)
//   - 구성 조건: 영문, 숫자, 특수문자 포함 (모든 문자종류 포함)

//   ● Learn by Doing

//   Context: 비밀번호 조건을 5개에서 2개 그룹으로 압축하여 깔끔한 UI를 만들어야 합니다.
//   각 그룹의 만족 여부에 따라 초록색/빨간색으로 표시하고, 비밀번호 보기/숨기기 토글
//   기능도 함께 구현해야 합니다.

//   Your Task: apps/web/src/features/auth/hooks/usePasswordStep.ts 파일을 새로 만들어서
//   비밀번호 입력 단계 훅을 구현해주세요. TODO(human) 섹션을 찾아서 다음을 구현해주세요:

//   1. showPassword 상태와 togglePasswordVisibility 함수
//   2. passwordChecks 객체 - 2개 그룹으로 압축된 조건
//     - lengthValid: 8-32자 길이 체크
//     - compositionValid: 영문+숫자+특수문자 모두 포함 체크
//   3. 실시간 비밀번호 감시 및 검증 로직

//   Guidance:
//   - useState(false)로 비밀번호 표시 상태 관리
//   - form.watch("password")로 실시간 감시
//   - 길이 조건: password.length >= 8 && password.length <= 32
//   - 구성 조건: 3개 정규식 모두 통과해야 true
//   - 반환값에 showPassword, togglePasswordVisibility, passwordChecks 포함

export const usePasswordStep = ({ onComplete }: UsePasswordStepProps) => {
  const [showPassword, setShowPassword] = useState<boolean>(false)

  const form = useForm<PasswordStepData>({
    resolver: zodResolver(PasswordStepRules),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  })

  // 실시간 비밀번호 감시
  const password = form.watch("password")

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

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev)
  }

  const handleSubmit = form.handleSubmit((data) => {
    onComplete(data)
  })

  return {
    form,
    handleSubmit,
    passwordChecks,
    showPassword,
    togglePasswordVisibility,
  }
}
