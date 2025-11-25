import {
  type UserApiCreateUserRequest,
  type UserApiDeleteUserRequest,
  type UserApiUpdateUserRequest,
  type UserDeletionResponseWrapper,
  type UserResponse,
} from "@repo/api-client"

import { useMutation, useQueryClient } from "@tanstack/react-query"

import { userKeys } from "./queryKey"

import { ApiError } from "@/shared/api/core/types"
import { userApiService } from "@/shared/api/services/user-api-service"
import { useBaseMutation } from "@/shared/hooks/useBaseMutation"
import { MutationOptions } from "@/shared/types/basic-types"
import { createChainedCallbacks } from "@/shared/utils"

// 회원가입 (토스트 없음 - Fat Hook에서 처리)
export function useSignupUser({
  onSuccess,
  onError,
  ...mutationOptions
}: MutationOptions<UserResponse, UserApiCreateUserRequest> = {}) {
  return useMutation<UserResponse, ApiError, UserApiCreateUserRequest>({
    ...mutationOptions,
    mutationFn: (data) => userApiService.createUser({ ...data }),
    ...createChainedCallbacks({ domainLogic: () => {}, callbacks: { onSuccess, onError } }),
  })
}

// 사용자 생성 (관리자용)
export function useCreateUser({
  onSuccess,
  onError,
  ...mutationOptions
}: MutationOptions<UserResponse, UserApiCreateUserRequest> = {}) {
  return useBaseMutation<UserResponse, ApiError, UserApiCreateUserRequest>({
    ...mutationOptions,
    mutationFn: (data) => userApiService.createUser({ ...data }),
    invalidateKeys: [userKeys.lists().queryKey],
    ...createChainedCallbacks({ domainLogic: () => {}, callbacks: { onSuccess, onError } }),
  })
}

// 사용자 정보 수정
export function useUpdateUser(
  id: string,
  { onSuccess, onError, ...mutationOptions }: MutationOptions<UserResponse, UserApiUpdateUserRequest> = {},
) {
  const queryClient = useQueryClient()

  return useBaseMutation<UserResponse, ApiError, UserApiUpdateUserRequest>({
    ...mutationOptions,
    mutationFn: (data) => userApiService.updateUser({ ...data }),
    invalidateKeys: [userKeys.detail(id).queryKey, userKeys.lists().queryKey],
    ...createChainedCallbacks({
      domainLogic: async (_response, variables) => {
        // Invalidate specific user detail query and general user lists
        queryClient.invalidateQueries({ queryKey: userKeys.detail(id).queryKey })
        queryClient.invalidateQueries({ queryKey: userKeys.lists().queryKey })
      },
      callbacks: { onSuccess, onError },
    }),
  })
}

// 사용자 삭제
export function useDeleteUser({
  onSuccess,
  onError,
  ...mutationOptions
}: MutationOptions<UserDeletionResponseWrapper, UserApiDeleteUserRequest> = {}) {
  const queryClient = useQueryClient()

  return useBaseMutation<UserDeletionResponseWrapper, ApiError, UserApiDeleteUserRequest>({
    ...mutationOptions,
    mutationFn: (data) => userApiService.deleteUser({ ...data }),
    invalidateKeys: [
      userKeys.lists().queryKey,
      // 삭제된 사용자의 detail도 무효화 (onSuccess에서 idx 접근 가능)
    ],
    ...createChainedCallbacks({
      domainLogic: async (_response, variables) => {
        // 특정 사용자 detail 쿼리도 무효화
        queryClient.invalidateQueries({ queryKey: userKeys.detail(variables.idx.toString()).queryKey })
      },
      callbacks: { onSuccess, onError },
    }),
  })
}
