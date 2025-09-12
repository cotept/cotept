/**
 * @fileoverview 회원가입 오버레이 피드백 시스템
 * @description 회원가입 과정에서 발생하는 성공/실패 알림과 사용자 확인을 관리
 */

import { useCallback } from "react"

import { useRouter } from "next/navigation"

import { SIGNUP_STEPS, type SignupStep } from "@/shared/constants/basic-types"
import { SystemAlert } from "@/shared/ui/overlay/components/SystemAlert"
import { SystemConfirm } from "@/shared/ui/overlay/components/SystemConfirm"
import { overlay } from "@/shared/ui/overlay/createOverlayContext"

/**
 * 오버레이 피드백 옵션
 */
interface FeedbackOptions {
  /** 자동 닫기 시간(ms), 0이면 수동 */
  autoClose?: number
  /** 성공 후 자동 이동할 단계 */
  navigateToStep?: SignupStep
  /** 실패 후 자동 이동할 단계 */
  fallbackStep?: SignupStep
}

/**
 * 회원가입 단계별 피드백 메시지
 */
const STEP_SUCCESS_MESSAGES: Record<SignupStep, string> = {
  [SIGNUP_STEPS.TERMS_AGREEMENT]: "약관 동의가 완료되었습니다.",
  [SIGNUP_STEPS.ENTER_EMAIL]: "이메일이 성공적으로 등록되었습니다.",
  [SIGNUP_STEPS.VERIFY_EMAIL]: "이메일 인증이 완료되었습니다.",
  [SIGNUP_STEPS.SET_USERID]: "아이디가 성공적으로 설정되었습니다.",
  [SIGNUP_STEPS.SET_PASSWORD]: "비밀번호가 성공적으로 설정되었습니다.",
  [SIGNUP_STEPS.SIGNUP_COMPLETE]: "회원가입이 완료되었습니다!",
}

const STEP_ERROR_MESSAGES: Record<SignupStep, string> = {
  [SIGNUP_STEPS.TERMS_AGREEMENT]: "약관 동의 처리 중 오류가 발생했습니다.",
  [SIGNUP_STEPS.ENTER_EMAIL]: "이메일 등록 중 오류가 발생했습니다.",
  [SIGNUP_STEPS.VERIFY_EMAIL]: "이메일 인증 중 오류가 발생했습니다.",
  [SIGNUP_STEPS.SET_USERID]: "아이디 설정 중 오류가 발생했습니다.",
  [SIGNUP_STEPS.SET_PASSWORD]: "비밀번호 설정 중 오류가 발생했습니다.",
  [SIGNUP_STEPS.SIGNUP_COMPLETE]: "회원가입 완료 중 오류가 발생했습니다.",
}

export function useSignupOverlay() {
  const router = useRouter()

  /**
   * 성공 알림 표시
   */
  const showSuccess = useCallback(
    async (step: SignupStep, options: FeedbackOptions = {}) => {
      const { autoClose = 3000, navigateToStep } = options

      await overlay
        .openAsync<void>(({ isOpen, close, overlayId, unmount }) => (
          <SystemAlert
            isOpen={isOpen}
            close={close}
            overlayId={overlayId}
            unmount={unmount}
            title="성공"
            description={STEP_SUCCESS_MESSAGES[step]}
            variant="success"
            autoClose={autoClose}
            showIcon
          />
        ))
        .then(() => {
          // 알림 닫힌 후 자동 이동
          if (navigateToStep) {
            router.push(`/auth/signup?step=${navigateToStep}`)
          }
        })
    },
    [router],
  )

  /**
   * 실패 알림 표시
   */
  const showError = useCallback(
    async (step: SignupStep, options: FeedbackOptions & { customMessage?: string } = {}) => {
      const { autoClose = 5000, fallbackStep, customMessage } = options
      const message = customMessage || STEP_ERROR_MESSAGES[step]

      await overlay
        .openAsync<void>(({ isOpen, close, overlayId, unmount }) => (
          <SystemAlert
            isOpen={isOpen}
            close={close}
            overlayId={overlayId}
            unmount={unmount}
            title="오류"
            description={message}
            variant="destructive"
            autoClose={autoClose}
            showIcon
          />
        ))
        .then(() => {
          // 실패 후 특정 단계로 이동
          if (fallbackStep) {
            router.push(`/auth/signup?step=${fallbackStep}`)
          }
        })
    },
    [router],
  )

  /**
   * 경고 알림 표시 (자동 닫기 없음)
   */
  const showWarning = useCallback(async (message: string) => {
    await overlay.open(({ isOpen, close, overlayId, unmount }) => (
      <SystemAlert
        isOpen={isOpen}
        close={close}
        overlayId={overlayId}
        unmount={unmount}
        title="확인 필요"
        description={message}
        variant="default"
        autoClose={0} // 수동 닫기
        showIcon
      />
    ))
  }, [])

  /**
   * 확인 다이얼로그 표시
   */
  const showConfirm = useCallback(
    async (
      title: string,
      message: string,
      options: {
        confirmText?: string
        cancelText?: string
        variant?: "default" | "destructive"
      } = {},
    ): Promise<boolean> => {
      const { confirmText = "확인", cancelText = "취소", variant = "default" } = options

      return await overlay.openAsync<boolean>(({ isOpen, close, overlayId, unmount }) => (
        <SystemConfirm
          isOpen={isOpen}
          close={close}
          overlayId={overlayId}
          unmount={unmount}
          title={title}
          description={message}
          confirmText={confirmText}
          cancelText={cancelText}
          confirmVariant={variant}
          showIcon
        />
      ))
    },
    [],
  )

  /**
   * 단계 이동 확인
   */
  const confirmStepNavigation = useCallback(
    async (targetStep: SignupStep, reason?: string): Promise<boolean> => {
      const defaultMessage = `입력하신 정보가 저장되지 않을 수 있습니다. ${targetStep} 단계로 이동하시겠습니까?`
      const message = reason || defaultMessage

      return await showConfirm("단계 이동 확인", message, {
        confirmText: "이동",
        cancelText: "취소",
        variant: "default",
      })
    },
    [showConfirm],
  )

  /**
   * 회원가입 취소 확인
   */
  const confirmSignupCancellation = useCallback(async (): Promise<boolean> => {
    return await showConfirm(
      "회원가입 취소",
      "지금까지 입력한 정보가 모두 삭제됩니다. 정말 회원가입을 취소하시겠습니까?",
      {
        confirmText: "취소하기",
        cancelText: "계속하기",
        variant: "destructive",
      },
    )
  }, [showConfirm])

  /**
   * 유효성 검사 실패 시 알림 및 자동 이동
   */
  const showValidationError = useCallback(
    async (errors: Record<string, string>, requiredStep?: SignupStep) => {
      const errorMessages = Object.values(errors)
      const message = errorMessages.join(" ")

      await overlay
        .openAsync<void>(({ isOpen, close, overlayId, unmount }) => (
          <SystemAlert
            isOpen={isOpen}
            close={close}
            overlayId={overlayId}
            unmount={unmount}
            title="입력 정보 확인"
            description={`${message}${requiredStep ? ` ${requiredStep} 단계를 완료해주세요.` : ""}`}
            variant="default"
            autoClose={4000}
            showIcon
          />
        ))
        .then(() => {
          // 유효성 검사 실패 시 필수 단계로 자동 이동
          if (requiredStep) {
            router.push(`/auth/signup?step=${requiredStep}`)
          }
        })
    },
    [router],
  )
  /**
   * 최종 회원가입 성공
   */

  const showFinalSuccess = useCallback(async () => {
    console.log("showFinalSuccess called")
    const isSelectOnBoarding = await overlay.openAsync<boolean>(({ isOpen, close, overlayId, unmount }) => (
      <SystemConfirm
        isOpen={isOpen}
        close={close}
        overlayId={overlayId}
        unmount={unmount}
        title="🎉 회원가입 완료!"
        description="CotePT에 오신 것을 환영합니다. 이제 1:1 멘토링 서비스를 이용하실 수 있습니다."
        variant="default"
        confirmText="온보딩 시작하기"
        cancelText="나중에 하기"
        showIcon
      />
    ))

    if (isSelectOnBoarding) {
      router.push("/onboarding")
    } else {
      router.push("/")
    }
  }, [router])

  return {
    showSuccess,
    showError,
    showWarning,
    showConfirm,
    confirmStepNavigation,
    confirmSignupCancellation,
    showValidationError,
    showFinalSuccess,
  }
}
