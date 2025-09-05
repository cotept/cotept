import { useCallback, useMemo, useState } from "react"

import { type ValidationCheck } from "@repo/shared/src/components/validation-indicator"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import { useCheckUserIdAvailability } from "@/features/auth/apis/queries"
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

const isValidUserId = (userId: string): boolean => SetUserIdRules.safeParse({ userId }).success

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
export function useSetUserId({ onComplete }: UseSetUserIdStepProps) {
  const [phase, setPhase] = useState<userIdCheckPhase>("initial")

  const form = useForm<SetUserIdData>({
    resolver: zodResolver(SetUserIdRules),
    defaultValues: {
      userId: "",
    },
  })

  const userId = form.watch("userId")
  const isUserIdValid = isValidUserId(userId)

  // 실시간 유효성 검사 - Zod 기반
  const userIdChecks = useMemo(() => {
    if (!userId) {
      return {
        lengthValid: false,
        formatValid: false,
        compositionValid: false,
      }
    }

    const userIdOnlyCheckResult = SetUserIdRules.pick({ userId: true }).safeParse({ userId })

    if (userIdOnlyCheckResult.success) {
      return {
        lengthValid: true,
        formatValid: true,
        compositionValid: true,
      }
    }

    const _error = userIdOnlyCheckResult.error.flatten().fieldErrors.userId || []

    const lengthValid = !_error.some((error) => error.includes("6자 이상") || error.includes("20자 이하"))
    const formatValid = !_error.some((error) => error.includes("영문과 숫자만 사용할 수 있습니다"))
    const compositionValid = !_error.some((error) => error.includes("영문과 숫자를 모두 포함해야 합니다"))

    return {
      lengthValid,
      formatValid,
      compositionValid,
    }
  }, [userId])

  // 모든 기본 규칙이 통과되어야 중복 확인 가능
  const isAllBasicChecksValid = userIdChecks.lengthValid && userIdChecks.formatValid && userIdChecks.compositionValid

  // ValidationIndicator용 체크 배열 생성 (비즈니스 로직)
  const validationChecks: ValidationCheck[] = useMemo(
    () => [
      {
        id: "length",
        label: "6자 이상 20자 이하",
        isValid: userIdChecks.lengthValid,
      },
      {
        id: "format",
        label: "영문과 숫자만 사용",
        isValid: userIdChecks.formatValid,
      },
      {
        id: "composition",
        label: "영문과 숫자 모두 포함",
        isValid: userIdChecks.compositionValid,
      },
    ],
    [userIdChecks],
  )

  // RHF의 isDirty 상태 가져오기
  const { isDirty } = form.formState
  
  // 인디케이터 표시 조건 (비즈니스 로직)
  // 검증 완료(verified) 상태에서는 숨기고, 그 외에는 항상 표시 (색상은 isDirty로 제어)
  const shouldShowValidationIndicator = useMemo(() => {
    return phase !== "verified"
  }, [phase])
  console.log({ shouldShowValidationIndicator })
  const { isLoading, refetch: checkUserIdAvailability } = useCheckUserIdAvailability(userId, {
    enabled: false, // 수동 실행만
    retry: false,
    staleTime: 0,
  })

  const handleCheckUserId = useCallback(async () => {
    if (!isAllBasicChecksValid) return
    setPhase("checking")
    form.clearErrors("userId")
    try {
      const response = await checkUserIdAvailability()
      const availabilityData = response.data?.data
      if (availabilityData) {
        setPhase("verified")
      }
    } catch (error: any) {
      setPhase("error")
      const errorMessage = error?.response?.data?.message || "중복 확인 중 오류가 발생했습니다"
      form.setError("userId", {
        message: errorMessage,
      })
    }
  }, [isAllBasicChecksValid, checkUserIdAvailability, form])

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
    isLoading,
    userId,
    isUserIdValid,
    isUserIdVerified: phase === "verified",
    hasError: phase === "error",

    // 실시간 유효성 검사
    userIdChecks,
    isAllBasicChecksValid,

    // ValidationIndicator 관련 (비즈니스 로직)
    validationChecks,
    shouldShowValidationIndicator,
    isDirty,

    // UI 상태 헬퍼
    canCheckUserId: canCheckUserId(isAllBasicChecksValid, phase, isLoading),
    canProceedNext: canProceedNext(phase),
    showCheckingSpinner: shouldShowCheckingSpinner(phase, isLoading),

    // 버튼 텍스트 헬퍼
    checkButtonText: getCheckButtonText(phase),
  }
}
