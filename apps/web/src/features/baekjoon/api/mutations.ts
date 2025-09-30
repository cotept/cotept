import { type UseMutationOptions, useQueryClient } from "@tanstack/react-query"

import { baekjoonKeys, baekjoonQueryUtils } from "./queryKey"

import type {
  BaekjoonApiCompleteVerificationRequest,
  BaekjoonApiStartVerificationRequest,
  VerificationResultResponseWrapper,
  VerificationStatusResponseWrapper,
} from "@repo/api-client"

import { ApiError } from "@/shared/api/core/types"
import { baekjoonApiService } from "@/shared/api/services/baekjoon-api-service"
import { useBaseMutation } from "@/shared/hooks/useBaseMutation"

// 백준 인증 시작
export function useStartBaekjoonVerification(
  userId: string,
  options?: Pick<
    UseMutationOptions<VerificationStatusResponseWrapper, ApiError, BaekjoonApiStartVerificationRequest>,
    "onSuccess" | "onError"
  >,
) {
  const queryClient = useQueryClient()

  return useBaseMutation<VerificationStatusResponseWrapper, ApiError, BaekjoonApiStartVerificationRequest>({
    mutationFn: (data) => baekjoonApiService.startVerification({ ...data }),
    queryKey: baekjoonKeys.verification().queryKey,
    successMessage: "백준 인증이 시작되었습니다.",
    onSuccess: async (response, variables, context) => {
      // 백준 인증 관련 쿼리들 무효화
      baekjoonQueryUtils.invalidateVerificationRelated(queryClient, userId)

      // 사용자 호출 콜백 실행
      options?.onSuccess?.(response, variables, context)
    },
    ...options,
  })
}

// 백준 인증 완료
export function useCompleteBaekjoonVerification(
  userId: string,
  options?: Pick<
    UseMutationOptions<VerificationResultResponseWrapper, ApiError, BaekjoonApiCompleteVerificationRequest>,
    "onSuccess" | "onError"
  >,
) {
  const queryClient = useQueryClient()

  return useBaseMutation<VerificationResultResponseWrapper, ApiError, BaekjoonApiCompleteVerificationRequest>({
    mutationFn: (data) => baekjoonApiService.completeVerification({ ...data }),
    queryKey: baekjoonKeys.verification().queryKey,
    successMessage: "백준 인증이 완료되었습니다.",
    onSuccess: async (response, variables, context) => {
      // 백준 인증 관련 쿼리들 무효화
      baekjoonQueryUtils.invalidateVerificationRelated(queryClient, userId)

      // 백준 프로필과 통계도 무효화 (인증 완료 후 새로운 데이터)
      if (variables?.completeVerificationRequestDto?.handle) {
        const handle = variables.completeVerificationRequestDto.handle
        baekjoonQueryUtils.invalidateProfile(queryClient, handle)
        baekjoonQueryUtils.invalidateStatisticsById(queryClient, handle)
      }

      // 사용자 호출 콜백 실행
      options?.onSuccess?.(response, variables, context)
    },
    ...options,
  })
}
