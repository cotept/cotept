import {
  BasicProfileCreationResponseWrapper,
  UserProfileApiCreateBasicProfileForSignupRequest,
  type UserProfileApiCreateUserProfileRequest,
  UserProfileApiDeleteUserProfileRequest,
  UserProfileApiUpdateUserProfileRequest,
  UserProfileApiUpsertUserProfileRequest,
  type UserProfileCreationResponseWrapper,
  UserProfileDeletionResponseWrapper,
  UserProfileUpdateResponseWrapper,
  UserProfileUpsertResponseWrapper,
} from "@repo/api-client"

import { type UseMutationOptions, useQueryClient } from "@tanstack/react-query"

import { userProfileKeys, userProfileQueryUtils } from "./queryKey"

import { ApiError } from "@/shared/api/core/types"
import { userProfileApiService } from "@/shared/api/services/user-profile-api-service"
import { useBaseMutation } from "@/shared/hooks/useBaseMutation"

// 프로필 생성
export function useCreateUserProfile(
  options?: UseMutationOptions<UserProfileCreationResponseWrapper, ApiError, UserProfileApiCreateUserProfileRequest>,
) {
  const queryClient = useQueryClient()

  return useBaseMutation<UserProfileCreationResponseWrapper, ApiError, UserProfileApiCreateUserProfileRequest>({
    mutationFn: (data) => userProfileApiService.createUserProfile({ ...data }),
    invalidateKeys: [userProfileKeys.all.queryKey],
    successMessage: "프로필이 성공적으로 생성되었습니다.",
    onSuccess: (response, variables, context) => {
      // 관련 쿼리들 무효화
      userProfileQueryUtils.invalidateAll(queryClient)

      // 생성된 프로필의 userId가 있다면 해당 프로필 쿼리도 무효화
      if (variables?.createUserProfileRequestDto?.userId) {
        userProfileQueryUtils.invalidateProfile(queryClient, variables.createUserProfileRequestDto.userId)
        userProfileQueryUtils.invalidateCompleteness(queryClient, variables.createUserProfileRequestDto.userId)
      }

      options?.onSuccess?.(response, variables, context)
    },
    onError: (error, variables, context) => {
      options?.onError?.(error, variables, context)
    },
  })
}

// 프로필 수정
export function useUpdateUserProfile(
  options?: UseMutationOptions<UserProfileUpdateResponseWrapper, ApiError, UserProfileApiUpdateUserProfileRequest>,
) {
  const queryClient = useQueryClient()

  return useBaseMutation<UserProfileUpdateResponseWrapper, ApiError, UserProfileApiUpdateUserProfileRequest>({
    mutationFn: (data) => userProfileApiService.updateUserProfile({ ...data }),
    invalidateKeys: [userProfileKeys.all.queryKey],
    successMessage: "프로필이 성공적으로 수정되었습니다.",
    onSuccess: (response, variables, context) => {
      // 수정된 프로필 관련 쿼리 무효화
      const userId = variables?.userId
      if (userId) {
        userProfileQueryUtils.invalidateProfileRelated(queryClient, userId)
      } else {
        userProfileQueryUtils.invalidateAll(queryClient)
      }

      options?.onSuccess?.(response, variables, context)
    },
    onError: (error, variables, context) => {
      options?.onError?.(error, variables, context)
    },
  })
}

// 프로필 삭제
export function useDeleteUserProfile(
  options?: UseMutationOptions<UserProfileDeletionResponseWrapper, ApiError, UserProfileApiDeleteUserProfileRequest>,
) {
  const queryClient = useQueryClient()

  return useBaseMutation<UserProfileDeletionResponseWrapper, ApiError, UserProfileApiDeleteUserProfileRequest>({
    mutationFn: (data) => userProfileApiService.deleteUserProfile({ ...data }),
    invalidateKeys: [userProfileKeys.all.queryKey],
    successMessage: "프로필이 성공적으로 삭제되었습니다.",
    onSuccess: (response, variables, context) => {
      // 삭제된 프로필 관련 쿼리 클리어
      const userId = variables?.userId
      if (userId) {
        userProfileQueryUtils.clearUserProfileQueries(queryClient, userId)
      }

      // 전체 프로필 목록 쿼리 무효화
      userProfileQueryUtils.invalidateAll(queryClient)

      options?.onSuccess?.(response, variables, context)
    },
    onError: (error, variables, context) => {
      options?.onError?.(error, variables, context)
    },
  })
}

// 프로필 생성 또는 업데이트 (upsert)
export function useUpsertUserProfile(
  options?: UseMutationOptions<UserProfileUpsertResponseWrapper, ApiError, UserProfileApiUpsertUserProfileRequest>,
) {
  const queryClient = useQueryClient()

  return useBaseMutation<UserProfileUpsertResponseWrapper, ApiError, UserProfileApiUpsertUserProfileRequest>({
    mutationFn: (data) => userProfileApiService.upsertUserProfile({ ...data }),
    invalidateKeys: [userProfileKeys.all.queryKey],
    successMessage: "프로필이 성공적으로 처리되었습니다.",
    onSuccess: (response, variables, context) => {
      // upsert된 프로필 관련 쿼리 무효화
      const userId = variables?.userId
      if (userId) {
        userProfileQueryUtils.invalidateProfileRelated(queryClient, userId)
      } else {
        userProfileQueryUtils.invalidateAll(queryClient)
      }

      options?.onSuccess?.(response, variables, context)
    },
    onError: (error, variables, context) => {
      options?.onError?.(error, variables, context)
    },
  })
}

// 회원가입용 기본 프로필 생성
export function useCreateBasicProfileForSignup(
  options?: UseMutationOptions<
    BasicProfileCreationResponseWrapper,
    ApiError,
    UserProfileApiCreateBasicProfileForSignupRequest
  >,
) {
  const queryClient = useQueryClient()

  return useBaseMutation<
    BasicProfileCreationResponseWrapper,
    ApiError,
    UserProfileApiCreateBasicProfileForSignupRequest
  >({
    mutationFn: (data) => userProfileApiService.createBasicProfileForSignup({ ...data }),
    invalidateKeys: [userProfileKeys.basicProfile().queryKey],
    successMessage: "기본 프로필이 생성되었습니다.",
    onSuccess: (response, variables, context) => {
      // 기본 프로필 관련 쿼리 무효화
      userProfileQueryUtils.invalidateBasicProfile(queryClient)
      userProfileQueryUtils.invalidateAll(queryClient)

      options?.onSuccess?.(response, variables, context)
    },
    onError: (error, variables, context) => {
      options?.onError?.(error, variables, context)
    },
  })
}
