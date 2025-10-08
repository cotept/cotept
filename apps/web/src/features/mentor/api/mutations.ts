import { type UseMutationOptions, useQueryClient } from "@tanstack/react-query"

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

// 멘토 프로필 생성
export function useCreateMentorProfile(
  options?: Pick<
    UseMutationOptions<MentorProfileDto, ApiError, MentorApiCreateMentorProfileRequest>,
    "onSuccess" | "onError"
  >,
) {
  const queryClient = useQueryClient()

  return useBaseMutation<MentorProfileDto, ApiError, MentorApiCreateMentorProfileRequest>({
    mutationFn: (data) => mentorApiService.createMentorProfile({ ...data }),
    queryKey: mentorKeys.profiles().queryKey,
    successMessage: "멘토 프로필이 생성되었습니다.",
    onSuccess: async (response, variables, context) => {
      // 멘토 프로필 관련 모든 쿼리 무효화
      mentorQueryUtils.invalidateMentorRelated(queryClient)

      // 사용자 호출 콜백 실행
      options?.onSuccess?.(response, variables, context)
    },
    ...options,
  })
}

// 멘토 프로필 수정
export function useUpdateMentorProfile(
  options?: Pick<
    UseMutationOptions<MentorProfileDto, ApiError, MentorApiUpdateMentorProfileRequest>,
    "onSuccess" | "onError"
  >,
) {
  const queryClient = useQueryClient()

  return useBaseMutation<MentorProfileDto, ApiError, MentorApiUpdateMentorProfileRequest>({
    mutationFn: (data) => mentorApiService.updateMentorProfile({ ...data }),
    queryKey: mentorKeys.profiles().queryKey,
    successMessage: "멘토 프로필이 수정되었습니다.",
    onSuccess: async (response, variables, context) => {
      // 멘토 프로필 관련 모든 쿼리 무효화
      mentorQueryUtils.invalidateMentorRelated(queryClient)

      // 특정 프로필 쿼리도 무효화 (idx가 있다면)
      if (variables?.idx) {
        // idx로는 userId를 알 수 없으므로 모든 프로필 쿼리 무효화
        mentorQueryUtils.invalidateProfiles(queryClient)
      }

      // 사용자 호출 콜백 실행
      options?.onSuccess?.(response, variables, context)
    },
    ...options,
  })
}

// 멘토 프로필 삭제 (소프트 삭제)
export function useDeleteMentorProfile(
  options?: Pick<
    UseMutationOptions<DeletionResponseDto, ApiError, MentorApiDeleteMentorProfileRequest>,
    "onSuccess" | "onError"
  >,
) {
  const queryClient = useQueryClient()

  return useBaseMutation<DeletionResponseDto, ApiError, MentorApiDeleteMentorProfileRequest>({
    mutationFn: (data) => mentorApiService.deleteMentorProfile({ ...data }),
    queryKey: mentorKeys.profiles().queryKey,
    successMessage: "멘토 프로필이 삭제되었습니다.",
    onSuccess: async (response, variables, context) => {
      // 멘토 프로필 관련 모든 쿼리 무효화
      mentorQueryUtils.invalidateMentorRelated(queryClient)

      // 사용자 호출 콜백 실행
      options?.onSuccess?.(response, variables, context)
    },
    ...options,
  })
}

// 멘토 프로필 영구 삭제
export function useHardDeleteMentorProfile(
  options?: Pick<
    UseMutationOptions<DeletionResponseDto, ApiError, MentorApiHardDeleteMentorProfileRequest>,
    "onSuccess" | "onError"
  >,
) {
  const queryClient = useQueryClient()

  return useBaseMutation<DeletionResponseDto, ApiError, MentorApiHardDeleteMentorProfileRequest>({
    mutationFn: (data) => mentorApiService.hardDeleteMentorProfile({ ...data }),
    queryKey: mentorKeys.profiles().queryKey,
    successMessage: "멘토 프로필이 영구 삭제되었습니다.",
    onSuccess: async (response, variables, context) => {
      // 멘토 프로필 관련 모든 쿼리 무효화
      mentorQueryUtils.invalidateMentorRelated(queryClient)

      // 캐시에서도 완전히 제거
      if (variables?.idx) {
        // idx로는 userId를 알 수 없으므로 모든 프로필 쿼리 무효화
        mentorQueryUtils.invalidateProfiles(queryClient)
      }

      // 사용자 호출 콜백 실행
      options?.onSuccess?.(response, variables, context)
    },
    ...options,
  })
}
