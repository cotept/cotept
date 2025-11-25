import { useQueryClient } from "@tanstack/react-query"

import { baekjoonKeys, baekjoonQueryUtils } from "./queryKey"

import type {
  BaekjoonApiCompleteVerificationRequest,
  BaekjoonApiStartVerificationRequest,
  BaekjoonVerificationResultResponseWrapper,
  VerificationStatusResponseWrapper,
} from "@repo/api-client"

import { ApiError } from "@/shared/api/core/types"
import { baekjoonApiService } from "@/shared/api/services/baekjoon-api-service"
import { useBaseMutation } from "@/shared/hooks/useBaseMutation"
import { MutationOptions } from "@/shared/types/basic-types"
import { createChainedCallbacks } from "@/shared/utils"

// 백준 인증 시작
export function useStartBaekjoonVerification(
  userId: string,
  {
    onSuccess,
    onError,
    ...mutationOptions
  }: MutationOptions<VerificationStatusResponseWrapper, BaekjoonApiStartVerificationRequest>,
) {
  const queryClient = useQueryClient()

  return useBaseMutation<VerificationStatusResponseWrapper, ApiError, BaekjoonApiStartVerificationRequest>({
    ...mutationOptions,
    mutationFn: (data) => baekjoonApiService.startVerification({ ...data }),
    invalidateKeys: [baekjoonKeys.verification().queryKey],
    ...createChainedCallbacks({
      domainLogic: async (response, variables, context) => {
        // 백준 인증 관련 쿼리들 무효화
        baekjoonQueryUtils.invalidateVerificationRelated(queryClient, userId)
      },
      callbacks: { onSuccess, onError },
    }),
  })
}

// 백준 인증 완료
export function useCompleteBaekjoonVerification(
  userId: string,
  {
    onSuccess,
    onError,
    ...mutationOptions
  }: MutationOptions<BaekjoonVerificationResultResponseWrapper, BaekjoonApiCompleteVerificationRequest>,
) {
  const queryClient = useQueryClient()

  return useBaseMutation<BaekjoonVerificationResultResponseWrapper, ApiError, BaekjoonApiCompleteVerificationRequest>({
    ...mutationOptions,
    mutationFn: (data) => baekjoonApiService.completeVerification({ ...data }),
    invalidateKeys: [baekjoonKeys.verification().queryKey],
    ...createChainedCallbacks({
      domainLogic: async (response, variables, context) => {
        // 백준 인증 관련 쿼리들 무효화
        baekjoonQueryUtils.invalidateVerificationRelated(queryClient, userId)

        // 백준 프로필과 통계도 무효화 (인증 완료 후 새로운 데이터)
        if (variables?.completeVerificationRequestDto?.handle) {
          const handle = variables.completeVerificationRequestDto.handle
          baekjoonQueryUtils.invalidateProfile(queryClient, handle)
          baekjoonQueryUtils.invalidateStatisticsById(queryClient, handle)
        }
      },
      callbacks: { onSuccess, onError },
    }),
  })
}
