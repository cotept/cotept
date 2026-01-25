import { useQueryClient } from "@tanstack/react-query"

import { mentorKeys, mentorQueryUtils } from "./queryKey"

import type {
  DeletionResponseDto,
  MentorApiCreateMentorProfileRequest,
  MentorApiDeleteMentorProfileRequest,
  MentorApiHardDeleteMentorProfileRequest,
  MentorApiUpdateMentorProfileRequest,
  MentorProfileDto,
} from "@repo/api-client/src"

import { ApiError } from "@/shared/api/core/types"
import { mentorApiService } from "@/shared/api/services/mentor-api-service"
import { useBaseMutation } from "@/shared/hooks/useBaseMutation"
import { MutationOptions } from "@/shared/types/basic-types"
import { createChainedCallbacks } from "@/shared/utils"

// 멘토 프로필 생성
export function useCreateMentorProfile({
  onSuccess,
  onError,
  ...mutationOptions
}: MutationOptions<MentorProfileDto, MentorApiCreateMentorProfileRequest>) {
  const queryClient = useQueryClient()

  return useBaseMutation<MentorProfileDto, ApiError, MentorApiCreateMentorProfileRequest>({
    ...mutationOptions,
    mutationFn: (data) => mentorApiService.createMentorProfile({ ...data }),
    invalidateKeys: [mentorKeys.profiles().queryKey],
    ...createChainedCallbacks({
      domainLogic: async (response, variables, context) => {
        // 멘토 프로필 관련 모든 쿼리 무효화
        mentorQueryUtils.invalidateMentorRelated(queryClient)
      },
      callbacks: { onSuccess, onError },
    }),
  })
}

// 멘토 프로필 수정
export function useUpdateMentorProfile({
  onSuccess,
  onError,
  ...mutationOptions
}: MutationOptions<MentorProfileDto, MentorApiUpdateMentorProfileRequest>) {
  const queryClient = useQueryClient()

  return useBaseMutation<MentorProfileDto, ApiError, MentorApiUpdateMentorProfileRequest>({
    ...mutationOptions,
    mutationFn: (data) => mentorApiService.updateMentorProfile({ ...data }),
    invalidateKeys: [mentorKeys.profiles().queryKey],
    ...createChainedCallbacks({
      domainLogic: async (response, variables, context) => {
        // 멘토 프로필 관련 모든 쿼리 무효화
        mentorQueryUtils.invalidateMentorRelated(queryClient)

        // 특정 프로필 쿼리도 무효화 (idx가 있다면)
        if (variables?.idx) {
          // idx로는 userId를 알 수 없으므로 모든 프로필 쿼리 무효화
          mentorQueryUtils.invalidateProfiles(queryClient)
        }
      },
      callbacks: { onSuccess, onError },
    }),
  })
}

// 멘토 프로필 삭제 (소프트 삭제)
export function useDeleteMentorProfile({
  onSuccess,
  onError,
  ...mutationOptions
}: MutationOptions<DeletionResponseDto, MentorApiDeleteMentorProfileRequest>) {
  const queryClient = useQueryClient()

  return useBaseMutation<DeletionResponseDto, ApiError, MentorApiDeleteMentorProfileRequest>({
    ...mutationOptions,
    mutationFn: (data) => mentorApiService.deleteMentorProfile({ ...data }),
    invalidateKeys: [mentorKeys.profiles().queryKey],
    ...createChainedCallbacks({
      domainLogic: async (response, variables, context) => {
        // 멘토 프로필 관련 모든 쿼리 무효화
        mentorQueryUtils.invalidateMentorRelated(queryClient)
      },
      callbacks: { onSuccess, onError },
    }),
  })
}

// 멘토 프로필 영구 삭제
export function useHardDeleteMentorProfile({
  onSuccess,
  onError,
  ...mutationOptions
}: MutationOptions<DeletionResponseDto, MentorApiHardDeleteMentorProfileRequest>) {
  const queryClient = useQueryClient()

  return useBaseMutation<DeletionResponseDto, ApiError, MentorApiHardDeleteMentorProfileRequest>({
    ...mutationOptions,
    mutationFn: (data) => mentorApiService.hardDeleteMentorProfile({ ...data }),
    invalidateKeys: [mentorKeys.profiles().queryKey],
    ...createChainedCallbacks({
      domainLogic: async (response, variables, context) => {
        // 멘토 프로필 관련 모든 쿼리 무효화
        mentorQueryUtils.invalidateMentorRelated(queryClient)

        // 캐시에서도 완전히 제거
        if (variables?.idx) {
          // idx로는 userId를 알 수 없으므로 모든 프로필 쿼리 무효화
          mentorQueryUtils.invalidateProfiles(queryClient)
        }
      },
      callbacks: { onSuccess, onError },
    }),
  })
}
