import { type UseMutationOptions, useQueryClient } from "@tanstack/react-query"

import { userProfileKeys, userProfileQueryUtils } from "./queryKey"

import type {
  CreateBasicProfileForSignupParams,
  CreateBasicProfileForSignupResponse,
  CreateUserProfileParams,
  CreateUserProfileResponse,
  DeleteUserProfileParams,
  DeleteUserProfileResponse,
  UpdateUserProfileParams,
  UpdateUserProfileResponse,
  UpsertUserProfileParams,
  UpsertUserProfileResponse,
} from "@/shared/types/user-profile.type"

import { ApiError } from "@/shared/api/core/types"
import { userProfileApiService } from "@/shared/api/services/user-profile-api-service"
import { useBaseMutation } from "@/shared/hooks/useBaseMutation"

// 프로필 생성
export function useCreateUserProfile(
  options?: Pick<
    UseMutationOptions<CreateUserProfileResponse, ApiError, CreateUserProfileParams>,
    "onSuccess" | "onError"
  >,
) {
  const queryClient = useQueryClient()

  return useBaseMutation<CreateUserProfileResponse, ApiError, CreateUserProfileParams>({
    mutationFn: (data) => userProfileApiService.createUserProfile(...data),
    queryKey: userProfileKeys.all.queryKey,
    successMessage: "프로필이 성공적으로 생성되었습니다.",
    onSuccess: (response, variables, context) => {
      // 관련 쿼리들 무효화
      userProfileQueryUtils.invalidateAll(queryClient)

      // 생성된 프로필의 userId가 있다면 해당 프로필 쿼리도 무효화
      if (variables[0]?.createUserProfileRequestDto?.userId) {
        userProfileQueryUtils.invalidateProfile(queryClient, variables[0].createUserProfileRequestDto.userId)
        userProfileQueryUtils.invalidateCompleteness(queryClient, variables[0].createUserProfileRequestDto.userId)
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
  options?: Pick<
    UseMutationOptions<UpdateUserProfileResponse, ApiError, UpdateUserProfileParams>,
    "onSuccess" | "onError"
  >,
) {
  const queryClient = useQueryClient()

  return useBaseMutation<UpdateUserProfileResponse, ApiError, UpdateUserProfileParams>({
    mutationFn: (data) => userProfileApiService.updateUserProfile(...data),
    queryKey: userProfileKeys.all.queryKey,
    successMessage: "프로필이 성공적으로 수정되었습니다.",
    onSuccess: (response, variables, context) => {
      // 수정된 프로필 관련 쿼리 무효화
      const userId = variables[0]?.userId
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
  options?: Pick<
    UseMutationOptions<DeleteUserProfileResponse, ApiError, DeleteUserProfileParams>,
    "onSuccess" | "onError"
  >,
) {
  const queryClient = useQueryClient()

  return useBaseMutation<DeleteUserProfileResponse, ApiError, DeleteUserProfileParams>({
    mutationFn: (data) => userProfileApiService.deleteUserProfile(...data),
    queryKey: userProfileKeys.all.queryKey,
    successMessage: "프로필이 성공적으로 삭제되었습니다.",
    onSuccess: (response, variables, context) => {
      // 삭제된 프로필 관련 쿼리 클리어
      const userId = variables[0]?.userId
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
  options?: Pick<
    UseMutationOptions<UpsertUserProfileResponse, ApiError, UpsertUserProfileParams>,
    "onSuccess" | "onError"
  >,
) {
  const queryClient = useQueryClient()

  return useBaseMutation<UpsertUserProfileResponse, ApiError, UpsertUserProfileParams>({
    mutationFn: (data) => userProfileApiService.upsertUserProfile(...data),
    queryKey: userProfileKeys.all.queryKey,
    successMessage: "프로필이 성공적으로 처리되었습니다.",
    onSuccess: (response, variables, context) => {
      // upsert된 프로필 관련 쿼리 무효화
      const userId = variables[0]?.userId
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
  options?: Pick<
    UseMutationOptions<CreateBasicProfileForSignupResponse, ApiError, CreateBasicProfileForSignupParams>,
    "onSuccess" | "onError"
  >,
) {
  const queryClient = useQueryClient()

  return useBaseMutation<CreateBasicProfileForSignupResponse, ApiError, CreateBasicProfileForSignupParams>({
    mutationFn: (data) => userProfileApiService.createBasicProfileForSignup(...data),
    queryKey: userProfileKeys.basicProfile().queryKey,
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
