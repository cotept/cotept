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

import { useQueryClient } from "@tanstack/react-query"

import { userProfileKeys, userProfileQueryUtils } from "./queryKey"

import { ApiError } from "@/shared/api/core/types"
import { userProfileApiService } from "@/shared/api/services/user-profile-api-service"
import { useBaseMutation } from "@/shared/hooks/useBaseMutation"
import { MutationOptions } from "@/shared/types/basic-types"
import { createChainedCallbacks } from "@/shared/utils"

// 프로필 생성
export function useCreateUserProfile({
  onSuccess,
  onError,
  ...mutationOptions
}: MutationOptions<UserProfileCreationResponseWrapper, UserProfileApiCreateUserProfileRequest> = {}) {
  const queryClient = useQueryClient()

  return useBaseMutation<UserProfileCreationResponseWrapper, ApiError, UserProfileApiCreateUserProfileRequest>({
    ...mutationOptions,
    mutationFn: (data) => userProfileApiService.createUserProfile({ ...data }),
    invalidateKeys: [userProfileKeys.all.queryKey],
    ...createChainedCallbacks({
      domainLogic: async (_response, variables) => {
        userProfileQueryUtils.invalidateAll(queryClient)

        if (variables?.createUserProfileRequestDto?.userId) {
          const userId = variables.createUserProfileRequestDto.userId
          userProfileQueryUtils.invalidateProfile(queryClient, userId)
          userProfileQueryUtils.invalidateCompleteness(queryClient, userId)
        }
      },
      callbacks: { onSuccess, onError },
    }),
  })
}

// 프로필 수정
export function useUpdateUserProfile({
  onSuccess,
  onError,
  ...mutationOptions
}: MutationOptions<UserProfileUpdateResponseWrapper, UserProfileApiUpdateUserProfileRequest> = {}) {
  const queryClient = useQueryClient()

  return useBaseMutation<UserProfileUpdateResponseWrapper, ApiError, UserProfileApiUpdateUserProfileRequest>({
    ...mutationOptions,
    mutationFn: (data) => userProfileApiService.updateUserProfile({ ...data }),
    invalidateKeys: [userProfileKeys.all.queryKey],
    ...createChainedCallbacks({
      domainLogic: async (_response, variables) => {
        const userId = variables?.userId
        if (userId) {
          userProfileQueryUtils.invalidateProfileRelated(queryClient, userId)
        } else {
          userProfileQueryUtils.invalidateAll(queryClient)
        }
      },
      callbacks: { onSuccess, onError },
    }),
  })
}

// 프로필 삭제
export function useDeleteUserProfile({
  onSuccess,
  onError,
  ...mutationOptions
}: MutationOptions<UserProfileDeletionResponseWrapper, UserProfileApiDeleteUserProfileRequest> = {}) {
  const queryClient = useQueryClient()

  return useBaseMutation<UserProfileDeletionResponseWrapper, ApiError, UserProfileApiDeleteUserProfileRequest>({
    ...mutationOptions,
    mutationFn: (data) => userProfileApiService.deleteUserProfile({ ...data }),
    invalidateKeys: [userProfileKeys.all.queryKey],
    ...createChainedCallbacks({
      domainLogic: async (_response, variables) => {
        const userId = variables?.userId
        if (userId) {
          userProfileQueryUtils.clearUserProfileQueries(queryClient, userId)
        }
        userProfileQueryUtils.invalidateAll(queryClient)
      },
      callbacks: { onSuccess, onError },
    }),
  })
}

// 프로필 upsert
export function useUpsertUserProfile({
  onSuccess,
  onError,
  ...mutationOptions
}: MutationOptions<UserProfileUpsertResponseWrapper, UserProfileApiUpsertUserProfileRequest> = {}) {
  const queryClient = useQueryClient()

  return useBaseMutation<UserProfileUpsertResponseWrapper, ApiError, UserProfileApiUpsertUserProfileRequest>({
    ...mutationOptions,
    mutationFn: (data) => userProfileApiService.upsertUserProfile({ ...data }),
    invalidateKeys: [userProfileKeys.all.queryKey],
    ...createChainedCallbacks({
      domainLogic: async (_response, variables) => {
        const userId = variables?.userId
        if (userId) {
          userProfileQueryUtils.invalidateProfileRelated(queryClient, userId)
        } else {
          userProfileQueryUtils.invalidateAll(queryClient)
        }
      },
      callbacks: { onSuccess, onError },
    }),
  })
}

// 회원가입용 기본 프로필 생성
export function useCreateBasicProfileForSignup({
  onSuccess,
  onError,
  ...mutationOptions
}: MutationOptions<BasicProfileCreationResponseWrapper, UserProfileApiCreateBasicProfileForSignupRequest> = {}) {
  const queryClient = useQueryClient()

  return useBaseMutation<
    BasicProfileCreationResponseWrapper,
    ApiError,
    UserProfileApiCreateBasicProfileForSignupRequest
  >({
    ...mutationOptions,
    mutationFn: (data) => userProfileApiService.createBasicProfileForSignup({ ...data }),
    invalidateKeys: [userProfileKeys.basicProfile().queryKey],
    ...createChainedCallbacks({
      domainLogic: async () => {
        userProfileQueryUtils.invalidateBasicProfile(queryClient)
        userProfileQueryUtils.invalidateAll(queryClient)
      },
      callbacks: { onSuccess, onError },
    }),
  })
}
