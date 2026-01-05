import { useCallback, useMemo, useState } from "react"

import { type ValidationCheck } from "@repo/shared/components/validation-indicator"
import { createValidationChecks, validateField } from "@repo/shared/src/rules/rule-helper"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import { useCheckUserIdAvailabilityMutation } from "@/features/auth/apis/mutations"
import { SetUserIdData, SetUserIdRules } from "@/features/auth/lib/validations/auth-rules"

interface UseSetUserIdStepProps {
  onComplete: (data: SetUserIdData) => void
}

/** 사용자 ID 확인 단계 */
type userIdCheckPhase =
  | "initial" // 초기 상태
  | "checking" // 중복 확인 중
  | "verified" // 중복 확인 완료 (사용 가능)
  | "error" // 에러 발생

/** 중복 확인 가능 여부 */
const canCheckUserId = (isAllBasicChecksValid: boolean, phase: userIdCheckPhase, isLoading: boolean): boolean => {
  return isAllBasicChecksValid && phase !== "verified" && !isLoading
}

/** 다음 단계 진행 가능 여부 */
const canProceedNext = (phase: userIdCheckPhase): boolean => {
  return phase === "verified"
}

/** 로딩 스피너 표시 여부 */
const shouldShowCheckingSpinner = (phase: userIdCheckPhase, isLoading: boolean): boolean => {
  return phase === "checking" || isLoading
}

/** 버튼 텍스트 결정 */
const getCheckButtonText = (phase: userIdCheckPhase): string => {
  if (phase === "checking") {
    return "확인 중..."
  }
  if (phase === "verified") {
    return "확인 완료"
  }
  return "중복 확인"
}
export function useSetUserIdStep({ onComplete }: UseSetUserIdStepProps) {
  const [phase, setPhase] = useState<userIdCheckPhase>("initial")

  const form = useForm<SetUserIdData>({
    resolver: zodResolver(SetUserIdRules),
    defaultValues: {
      userId: "",
    },
    mode: "onChange",
  })

  const userId = form.watch("userId")

  const validationChecks: ValidationCheck[] = useMemo(() => {
    if (!userId) {
      return [
        { id: "length", label: "6자 이상 20자 이하", isValid: false },
        { id: "format", label: "영문과 숫자만 사용", isValid: false },
        { id: "composition", label: "영문과 숫자 모두 포함", isValid: false },
      ]
    }
    const fieldValidation = validateField(SetUserIdRules.shape.userId, userId)
    return createValidationChecks(fieldValidation, [
      {
        id: "length",
        label: "6자 이상 20자 이하",
        isIssuePresent: (issues) => issues.some((i) => i.code === "too_small" || i.code === "too_big"),
      },
      {
        id: "format",
        label: "영문과 숫자만 사용",
        isIssuePresent: (issues) => issues.some((i) => i.path.includes("format")),
      },
      {
        id: "composition",
        label: "영문과 숫자 모두 포함",
        isIssuePresent: (issues) => issues.some((i) => i.path.includes("composition")),
      },
    ])
  }, [userId])

  const isAllBasicChecksValid = useMemo(() => validationChecks.every((check) => check.isValid), [validationChecks])

  // RHF의 isDirty 상태 가져오기
  const { isDirty } = form.formState

  // 인디케이터 표시 조건 (비즈니스 로직)
  // 검증 완료(verified) 상태에서는 숨기고, 그 외에는 항상 표시 (색상은 isDirty로 제어)
  const shouldShowValidationIndicator = useMemo(() => {
    return phase !== "verified"
  }, [phase])

  const checkUserIdMutation = useCheckUserIdAvailabilityMutation()

  const handleCheckUserId = useCallback(async () => {
    if (!isAllBasicChecksValid) return

    setPhase("checking")
    form.clearErrors("userId")

    try {
      const result = await checkUserIdMutation.mutateAsync(userId)
      if (result.data?.available) {
        setPhase("verified")
      } else {
        setPhase("error")
        form.setError("userId", { message: "이미 사용 중인 사용자 ID입니다" })
      }
    } catch {
      setPhase("error")
      // 에러는 mutation의 onError에서 이미 처리됨
    }
  }, [isAllBasicChecksValid, checkUserIdMutation, form, userId])

  const handleSubmit = form.handleSubmit((data) => {
    if (phase === "verified") {
      onComplete(data)
    }
  })

  const handleUserIdChange = useCallback(() => {
    if (phase === "verified" || phase === "error") {
      setPhase("initial")
      form.clearErrors("userId")
    }
  }, [phase, form])

  const [previousUserId, setPreviousUserId] = useState(userId)

  if (userId !== previousUserId) {
    setPreviousUserId(userId)
    handleUserIdChange()
  }

  return {
    form,
    handleCheckUserId,
    handleSubmit,

    // 상태
    phase,
    isLoading: checkUserIdMutation.isPending,
    userId,
    isUserIdValid: isAllBasicChecksValid,
    isUserIdVerified: phase === "verified",
    hasError: phase === "error",

    // 실시간 유효성 검사
    isAllBasicChecksValid,

    // ValidationIndicator 관련 (비즈니스 로직)
    validationChecks,
    shouldShowValidationIndicator,
    isDirty,

    // UI 상태 헬퍼
    canCheckUserId: canCheckUserId(isAllBasicChecksValid, phase, checkUserIdMutation.isPending),
    canProceedNext: canProceedNext(phase),
    showCheckingSpinner: shouldShowCheckingSpinner(phase, checkUserIdMutation.isPending),

    // 버튼 텍스트 헬퍼
    checkButtonText: getCheckButtonText(phase),
  }
}
