import { useCallback, useMemo, useState } from "react"

import { useSession } from "next-auth/react"

import { VerificationStatusResponseDto, VerificationStatusType } from "@repo/api-client/src"
import { ValidationCheck } from "@repo/shared/components/validation-indicator"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, useWatch } from "react-hook-form"
import { toast } from "sonner"

import {
  useCompleteBaekjoonVerification,
  useSkipBaekjoon,
  useStartBaekjoonVerification,
} from "@/features/onboarding/api/mutations"
import {
  createBaekjoonValidationChecks,
  getBaekjoonVerificationMessage,
  getSolvedAcProfileUrl,
} from "@/features/onboarding/lib/validations/helpers"
import {
  type BaekjoonVerifyStartFormData,
  BaekjoonVerifyStartFormRules,
  BaekjoonVerifyStepData,
} from "@/features/onboarding/lib/validations/onboarding-rules"
import { formatCountdownTime, useCountdown } from "@/shared/hooks/useCountdown"
import { copyToClipboard } from "@/shared/utils"

/**
 * 백준 인증 커스텀 훅 (개선 버전)
 *
 * ★ Insight:
 * - 단일 객체 state: 7개 개별 state → 1개 DTO 객체로 통합
 * - API 응답과 state 구조 일치로 타입 안전성 향상
 * - 원자적 업데이트: 중간 상태 없이 한 번에 모든 필드 업데이트
 * - useCountdown 훅으로 만료 시간 카운트다운
 * - 상태별 메시지 자동 생성 (getBaekjoonVerificationMessage)
 *
 * @param onComplete 인증 완료 시 콜백 (다음 단계로 이동)
 * @returns 폼 상태, 핸들러, 검증 체크, 인증 상태 등
 */
export const useBaekjoonVerification = ({ onComplete }: { onComplete: (data: BaekjoonVerifyStepData) => void }) => {
  const { data: session } = useSession()
  const userId = session?.member?.userId || null

  // 인증 세션 정보 (API 응답을 단일 객체로 관리)
  const [verificationSession, setVerificationSession] = useState<VerificationStatusResponseDto | null>(null)

  // 폼 설정
  const form = useForm<BaekjoonVerifyStartFormData>({
    resolver: zodResolver(BaekjoonVerifyStartFormRules),
    defaultValues: { baekjoonHandle: "" },
    mode: "onChange",
  })

  const baekjoonHandle = useWatch({ control: form.control, name: "baekjoonHandle", defaultValue: "" })

  // 실시간 검증 체크 생성
  const validationChecks: ValidationCheck[] = useMemo(() => {
    return createBaekjoonValidationChecks(baekjoonHandle)
  }, [baekjoonHandle])

  // 만료 시간 카운트다운
  const timeRemaining = useCountdown(verificationSession?.expiresAt ?? null, () => {
    if (verificationSession) {
      setVerificationSession({
        ...verificationSession,
        status: VerificationStatusType.EXPIRED,
      })
    }
    toast.error("인증 시간이 만료되었습니다. 다시 시도해주세요.")
  })

  // 백준 인증 시작 mutation
  const { mutate: startVerification, isPending: isStarting } = useStartBaekjoonVerification({
    onSuccess: ({ data: response }) => {
      if (!response) {
        toast.error("백준 인증을 시작할 수 없습니다. 다시 시도해주세요.")
        return
      }

      // API 응답을 단일 객체로 저장 (원자적 업데이트)
      setVerificationSession(response)

      toast.success("인증 코드가 발급되었습니다. solved.ac 프로필에 입력해주세요.")
    },
    onError: (error) => {
      // useBaseMutation에서 이미 처리된 ProcessedError를 받으므로 재처리 불필요
      toast.error(error.message)

      // 에러 발생 시 상태 업데이트
      if (verificationSession) {
        setVerificationSession({
          ...verificationSession,
          status: VerificationStatusType.FAILED,
          errorReason: error.message,
        })
      }
    },
  })

  // 인증 시작 핸들러
  const handleStartVerification = useCallback(
    (data: BaekjoonVerifyStartFormData) => {
      if (!userId) {
        toast.error("사용자 정보를 찾을 수 없습니다.")
        return
      }

      startVerification({
        startBaekjoonVerificationDto: {
          userId,
          baekjoonHandle: data.baekjoonHandle,
        },
      })
    },
    [userId, startVerification],
  )

  // 인증 코드 복사
  const handleCopyCode = useCallback(async () => {
    if (!verificationSession?.verificationString) {
      toast.error("복사할 인증 코드가 없습니다.")
      return
    }

    const success = await copyToClipboard(verificationSession.verificationString)
    if (success) {
      toast.success("인증 코드가 복사되었습니다.")
    } else {
      toast.error("복사에 실패했습니다.")
    }
  }, [verificationSession])

  // solved.ac 프로필 페이지 열기
  const handleOpenSolvedAc = useCallback(() => {
    const url = getSolvedAcProfileUrl()
    window.open(url, "_blank", "noopener,noreferrer")
  }, [])

  // 백준 인증 완료 mutation
  const { mutate: completeVerification, isPending: isCompleting } = useCompleteBaekjoonVerification({
    onSuccess: () => {
      toast.success("백준 인증이 완료되었습니다!")
      onComplete({
        baekjoonHandle: form.getValues("baekjoonHandle"),
        verificationSessionId: verificationSession?.sessionId,
      })
    },
    onError: (error) => {
      // useBaseMutation에서 이미 처리된 ProcessedError를 받으므로 재처리 불필요
      toast.error(error.message)

      // 에러 발생 시 상태 업데이트
      if (verificationSession) {
        setVerificationSession({
          ...verificationSession,
          status: VerificationStatusType.FAILED,
          errorReason: error.message,
        })
      }
    },
  })

  // 인증 완료 핸들러
  const handleCompleteVerification = useCallback(() => {
    if (!userId) {
      toast.error("사용자 정보를 찾을 수 없습니다.")
      return
    }

    if (!verificationSession?.sessionId) {
      toast.error("인증 세션을 찾을 수 없습니다.")
      return
    }

    completeVerification({
      completeBaekjoonVerificationDto: {
        userId,
        baekjoonHandle: form.getValues("baekjoonHandle"),
        verificationSessionId: verificationSession.sessionId,
      },
    })
  }, [userId, verificationSession, completeVerification, form])

  // 재시도 핸들러
  const handleRetry = useCallback(() => {
    setVerificationSession(null)
    form.reset()
  }, [form])

  // 백준 인증 건너뛰기 mutation
  const { mutate: skipBaekjoon, isPending: isSkipping } = useSkipBaekjoon({
    onSuccess: () => {
      toast.success("백준 인증을 건너뛰었습니다.")
      onComplete({ baekjoonHandle: "" })
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  // 인증 건너뛰기 핸들러
  const handleSkip = useCallback(() => {
    skipBaekjoon() // 인자가 필요없음 (userId는 서버에서 토큰으로 추출하거나 useMutation에서 처리)
  }, [skipBaekjoon])

  // 파생 상태 계산
  const status = verificationSession?.status ?? VerificationStatusType.PENDING
  const remainingAttempts = (verificationSession?.maxAttempts ?? 3) - (verificationSession?.attempts ?? 0)

  return {
    // 폼
    form,
    baekjoonHandle,
    validationChecks,

    // UI에 필요한 인증 정보만 노출
    verificationString: verificationSession?.verificationString ?? null,
    errorReason: verificationSession?.errorReason ?? null,

    // 타이머 (포맷팅된 값 제공)
    formattedTime: formatCountdownTime(timeRemaining),

    // 시도 횟수 (UI 표시용)
    remainingAttempts,

    // 상태 플래그 (UI 조건부 렌더링용)
    isExpired: status === VerificationStatusType.EXPIRED,
    isVerifying: status === VerificationStatusType.IN_PROGRESS,
    isCompleted: status === VerificationStatusType.COMPLETED,
    isFailed: status === VerificationStatusType.FAILED,
    isPending: status === VerificationStatusType.PENDING,

    // 상태 메시지 (토스트/알림용)
    statusMessage: getBaekjoonVerificationMessage(status),

    // 핸들러
    handleSubmit: form.handleSubmit(handleStartVerification),
    handleCopyCode,
    handleOpenSolvedAc,
    handleCompleteVerification,
    handleRetry,
    handleSkip,
    isStarting,
    isCompleting: isCompleting || isSkipping, // 스킵 중일 때도 로딩 처리

    // 유틸리티
    canSkip: true, // 항상 스킵 가능하도록 변경
  }
}
