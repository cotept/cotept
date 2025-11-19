import { useCallback, useReducer } from "react"

import { useSession } from "next-auth/react"

import { isEmpty } from "@repo/shared/lib/utils"

import { toast } from "sonner"

import { useCompleteBaekjoonVerification, useStartBaekjoonVerification } from "@/features/onboarding/api/mutations"

/**
 * API 에러 응답에서 에러 메시지를 추출하는 헬퍼 함수
 */
const extractErrorMessage = (error: any, defaultMessage: string): string => {
  return error?.response?.data?.message || error?.message || defaultMessage
}

/**
 * 백준 인증 단계
 * - idle: 초기 상태 (백준 ID 입력 대기)
 * - started: 인증 시작됨 (서버가 verificationString 생성 완료)
 * - verifying: 인증 완료 요청 중
 * - completed: 인증 성공
 * - failed: 인증 실패
 */
type VerificationStage = "idle" | "started" | "verifying" | "completed" | "failed"

/**
 * 백준 인증 상태
 */
type VerificationState = {
  // 인증 단계
  stage: VerificationStage

  // 입력 데이터
  baekjoonHandle: string

  // 서버 응답 데이터 (startVerification 성공 시 저장)
  sessionId: string | null
  verificationString: string | null // 서버가 생성한 랜덤 문자열 (예: "배부른고양이223")
  maxAttempts: number
  currentAttempts: number
  expiresAt: string | null

  // 상태 관리
  isLoading: boolean
  error: string | null
}

/**
 * 백준 인증 액션
 */
type VerificationAction =
  | { type: "SET_HANDLE"; payload: string }
  | { type: "START_REQUEST" }
  | {
      type: "START_SUCCESS"
      payload: { sessionId: string; verificationString: string; maxAttempts: number; expiresAt: string }
    }
  | { type: "START_FAILURE"; payload: string }
  | { type: "VERIFY_REQUEST" }
  | { type: "VERIFY_SUCCESS"; payload: { message: string } }
  | { type: "VERIFY_FAILURE"; payload: { errorReason: string; remainingAttempts: number } }
  | { type: "RESET" }

const initialState: VerificationState = {
  stage: "idle",
  baekjoonHandle: "",
  sessionId: null,
  verificationString: null,
  maxAttempts: 3,
  currentAttempts: 0,
  expiresAt: null,
  isLoading: false,
  error: null,
}

/**
 * 백준 인증 Reducer
 */
function verificationReducer(state: VerificationState, action: VerificationAction): VerificationState {
  switch (action.type) {
    case "SET_HANDLE":
      return {
        ...state,
        baekjoonHandle: action.payload,
        error: null,
      }

    case "START_REQUEST":
      return {
        ...state,
        isLoading: true,
        error: null,
        stage: "idle",
      }

    case "START_SUCCESS":
      return {
        ...state,
        isLoading: false,
        stage: "started",
        sessionId: action.payload.sessionId,
        verificationString: action.payload.verificationString,
        maxAttempts: action.payload.maxAttempts,
        expiresAt: action.payload.expiresAt,
        currentAttempts: 0,
        error: null,
      }

    case "START_FAILURE":
      return {
        ...state,
        isLoading: false,
        stage: "idle",
        error: action.payload,
      }

    case "VERIFY_REQUEST":
      return {
        ...state,
        isLoading: true,
        stage: "verifying",
        error: null,
      }

    case "VERIFY_SUCCESS":
      return {
        ...state,
        isLoading: false,
        stage: "completed",
        error: null,
      }

    case "VERIFY_FAILURE":
      return {
        ...state,
        isLoading: false,
        stage: "failed",
        error: action.payload.errorReason,
        currentAttempts: state.maxAttempts - action.payload.remainingAttempts,
      }

    case "RESET":
      return initialState

    default:
      return state
  }
}

/**
 * 백준 인증 완료 콜백 데이터
 */
export type BaekjoonVerifyData = {
  baekjoonHandle: string
}

/**
 * useBaekjoonVerify Props
 */
export interface UseBaekjoonVerifyProps {
  onComplete?: (data: BaekjoonVerifyData) => void
}

/**
 * 백준 ID 인증 훅
 *
 * **인증 프로세스**:
 * 1. 사용자가 백준 ID 입력 후 startVerification() 호출
 * 2. 서버가 랜덤 문자열 생성 (예: "배부른고양이223")
 * 3. 사용자에게 "solved.ac 프로필 이름에 해당 문자열 추가" 안내
 * 4. 사용자가 프로필 수정 후 completeVerification() 호출
 * 5. 서버가 solved.ac API로 프로필 이름 조회 후 문자열 일치 확인
 * 6. 일치하면 인증 완료, 불일치하면 인증 실패 (최대 3회 시도)
 *
 * @see docs/development/onBoard-flow.md - "백준 ID 점유 인증 프로세스"
 */
export function useBaekjoonVerify({ onComplete }: UseBaekjoonVerifyProps = {}) {
  const { data: session } = useSession()
  const user = session?.member
  const userId = user?.idx.toString()
  const [state, dispatch] = useReducer(verificationReducer, initialState)

  // API Mutations
  const startMutation = useStartBaekjoonVerification()
  const completeMutation = useCompleteBaekjoonVerification()

  /**
   * 백준 ID 설정
   */
  const setBaekjoonHandle = useCallback((handle: string) => {
    dispatch({ type: "SET_HANDLE", payload: handle })
  }, [])

  /**
   * 백준 인증 시작
   * - 백준 ID 존재 여부 확인
   * - 랜덤 인증 문자열 생성
   */
  const startVerification = useCallback(async () => {
    if (!userId) {
      toast.error("로그인이 필요합니다.")
      return
    }

    if (isEmpty(state.baekjoonHandle)) {
      toast.error("백준 ID를 입력해주세요.")
      return
    }

    dispatch({ type: "START_REQUEST" })

    try {
      const response = await startMutation.mutateAsync({
        startBaekjoonVerificationDto: {
          userId,
          baekjoonHandle: state.baekjoonHandle.trim(),
        },
      })

      if (!response.data) {
        const errorMsg = "백준 아이디 인증 시작 중 오류가 발생했습니다."
        dispatch({ type: "START_FAILURE", payload: errorMsg })
        return toast.error(errorMsg)
      }

      const { sessionId, verificationString, maxAttempts, expiresAt } = response.data

      dispatch({
        type: "START_SUCCESS",
        payload: { sessionId, verificationString, maxAttempts, expiresAt },
      })

      toast.success(`인증 문자열: "${response.data.verificationString}"\nsolved.ac 프로필 이름에 추가해주세요.`)
    } catch (error: any) {
      const errorMessage = extractErrorMessage(error, "인증 시작에 실패했습니다.")
      dispatch({ type: "START_FAILURE", payload: errorMessage })
      toast.error(errorMessage)
    }
  }, [state.baekjoonHandle, user, startMutation])

  /**
   * 백준 인증 완료
   * - solved.ac 프로필 이름에서 verificationString 확인
   * - 일치하면 인증 완료, 불일치하면 실패
   */
  const completeVerification = useCallback(async () => {
    if (!userId) {
      toast.error("로그인이 필요합니다.")
      return
    }

    if (!state.sessionId) {
      toast.error("인증 세션이 없습니다. 먼저 인증을 시작해주세요.")
      return
    }

    dispatch({ type: "VERIFY_REQUEST" })

    try {
      const response = await completeMutation.mutateAsync({
        completeBaekjoonVerificationDto: {
          userId,
          baekjoonHandle: state.baekjoonHandle.trim(),
          verificationSessionId: state.sessionId,
        },
      })

      if (!response.data) {
        const errorMsg = "백준 아이디 인증 중 오류가 발생했습니다."
        dispatch({
          type: "VERIFY_FAILURE",
          payload: { errorReason: errorMsg, remainingAttempts: 0 },
        })
        return toast.error(errorMsg)
      }

      if (response.data.success) {
        dispatch({
          type: "VERIFY_SUCCESS",
          payload: { message: response.data.message },
        })
        toast.success(response.data.message)
        onComplete?.({ baekjoonHandle: state.baekjoonHandle.trim() })
      } else {
        const { errorReason = "인증에 실패했습니다.", remainingAttempts = 0 } = response.data
        dispatch({
          type: "VERIFY_FAILURE",
          payload: { errorReason, remainingAttempts },
        })
        toast.error(`${errorReason}\n남은 시도 횟수: ${remainingAttempts}회`)
      }
    } catch (error: any) {
      const errorMessage = extractErrorMessage(error, "인증 완료 요청에 실패했습니다.")
      dispatch({
        type: "VERIFY_FAILURE",
        payload: {
          errorReason: errorMessage,
          remainingAttempts: 0,
        },
      })
      toast.error(errorMessage)
    }
  }, [state.sessionId, state.baekjoonHandle, user, completeMutation, onComplete])

  /**
   * 인증 초기화
   */
  const reset = useCallback(() => {
    dispatch({ type: "RESET" })
  }, [])

  return {
    // 상태
    baekjoonHandle: state.baekjoonHandle,
    verificationString: state.verificationString,
    sessionId: state.sessionId,
    stage: state.stage,
    isLoading: state.isLoading,
    error: state.error,
    currentAttempts: state.currentAttempts,
    maxAttempts: state.maxAttempts,
    expiresAt: state.expiresAt,

    // 메서드
    setBaekjoonHandle,
    startVerification,
    completeVerification,
    reset,
  }
}
