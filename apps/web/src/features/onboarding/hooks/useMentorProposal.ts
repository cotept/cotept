"use client"

import { useCallback, useEffect, useRef } from "react"

import { useSession } from "next-auth/react"

import { useCheckMentorEligibility } from "@/features/onboarding/api/queries"
import { openMentorProposalModal } from "@/features/onboarding/components/MentorProposalModal"

/**
 * 멘토 제안 훅 파라미터
 */
interface UseMentorProposalParams {
  /**
   * 멘토 제안 수락 시 콜백
   */
  onAccept: () => void
  /**
   * 멘토 제안 거절 또는 자격 미달 시 콜백
   */
  onDecline: () => void
}

/**
 * 멘토 제안 플로우 관리 커스텀 훅
 *
 * ★ Insight:
 * - 백준 인증 완료 후 멘토 자격 체크 및 제안 모달 표시 로직을 캡슐화
 * - NextAuth 세션에서 userId를 자동으로 가져와 API 호출
 * - React Query로 멘토 자격 조회 (enabled 옵션으로 조건부 실행)
 * - 자격 충족 시 멘토 제안 모달 표시, 미충족 시 onDecline 콜백 호출
 *
 * @param params - 수락/거절 콜백 함수
 * @returns checkEligibility - 멘토 자격 체크 트리거 함수
 *
 * @example
 * ```tsx
 * const { checkEligibility } = useMentorProposal({
 *   onAccept: () => handleMentorProposal(true),
 *   onDecline: () => handleMentorProposal(false),
 * })
 *
 * const handleBaekjoonComplete = (data) => {
 *   // 백준 인증 완료 후 멘토 자격 체크
 *   checkEligibility(data.baekjoonHandle)
 * }
 * ```
 */
export function useMentorProposal({ onAccept, onDecline }: UseMentorProposalParams) {
  const { data: session, status } = useSession()
  const userId = session?.member?.userId ?? null
  console.log({ userId })
  const pendingHandleRef = useRef<string | null>(null)
  const isCheckingRef = useRef(false)

  const params = {
    userId: userId ?? "",
  }
  const { refetch } = useCheckMentorEligibility(params, {
    enabled: false,
    staleTime: 0,
    gcTime: 0,
  })

  const runMentorProposalFlow = useCallback(
    async (handle: string) => {
      if (!userId || isCheckingRef.current) {
        return
      }

      isCheckingRef.current = true
      pendingHandleRef.current = null

      try {
        const result = await refetch({ throwOnError: true })
        const eligibility = result.data?.data

        if (!eligibility?.isEligible) {
          onDecline()
          return
        }

        const accepted = await openMentorProposalModal({
          tierLabel: eligibility.currentTier,
          baekjoonHandle: handle,
        })

        if (accepted) {
          onAccept()
        } else {
          onDecline()
        }
      } catch (error) {
        console.error("멘토 자격 확인 실패", error)
        onDecline()
      } finally {
        isCheckingRef.current = false
      }
    },
    [userId, refetch, onAccept, onDecline],
  )

  useEffect(() => {
    if (userId && pendingHandleRef.current && !isCheckingRef.current) {
      void runMentorProposalFlow(pendingHandleRef.current)
    }
  }, [userId, runMentorProposalFlow])

  /**
   * 멘토 자격 체크 트리거
   *
   * @param handle - 백준 핸들 (모달 표시용)
   */
  const checkEligibility = useCallback(
    (handle: string) => {
      pendingHandleRef.current = handle

      if (status === "loading") {
        return
      }

      if (!userId) {
        pendingHandleRef.current = null
        onDecline()
        return
      }

      void runMentorProposalFlow(handle)
    },
    [status, userId, runMentorProposalFlow, onDecline],
  )

  return { checkEligibility }
}
