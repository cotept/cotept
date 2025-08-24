import { type UseMutationOptions, useQueryClient } from "@tanstack/react-query"

import { userKeys, userQueryUtils } from "./queryKey"

import type {
  CreateUserParams,
  CreateUserResponse,
  DeleteUserParams,
  DeleteUserResponse,
  UpdateUserParams,
  UpdateUserRequestData,
  UpdateUserResponse,
} from "@/shared/types/user.type"

import { ApiError } from "@/shared/api/core/types"
import { userApiService } from "@/shared/api/services/user-api-service"
import { useBaseMutation } from "@/shared/hooks/useBaseMutation"
import { createOptimisticUpdate } from "@/shared/utils"

// 사용자 생성
export function useCreateUser(
  options?: Pick<UseMutationOptions<CreateUserResponse, ApiError, CreateUserParams>, "onSuccess" | "onError">,
) {
  const queryClient = useQueryClient()

  return useBaseMutation<CreateUserResponse, ApiError, CreateUserParams>({
    mutationFn: (data) => userApiService.createUser(...data),
    queryKey: userKeys.lists().queryKey,
    successMessage: "사용자가 성공적으로 생성되었습니다.",
    onSuccess: (response, variables, context) => {
      userQueryUtils.invalidateLists(queryClient)
      options?.onSuccess?.(response, variables, context)
    },
    onError: (error, variables, context) => {
      options?.onError?.(error, variables, context)
    },
  })
}

// 사용자 정보 수정 (Optimistic Update)
export function useUpdateUser(
  id: string,
  options?: Pick<UseMutationOptions<UpdateUserResponse, ApiError, UpdateUserParams>, "onSuccess" | "onError">,
) {
  const queryClient = useQueryClient()
  const optimisticUpdate = createOptimisticUpdate<UpdateUserResponse, UpdateUserRequestData>(queryClient)

  return useBaseMutation<UpdateUserResponse, ApiError, UpdateUserParams>({
    mutationFn: (data) => userApiService.updateUser(...data),
    queryKey: userKeys.detail(id).queryKey,
    successMessage: "사용자 정보가 성공적으로 수정되었습니다.",
    onMutate: (data, previousData) => {
      optimisticUpdate(userKeys.detail(id).queryKey, data[0].updateUserRequestDto, previousData)
      return { previousData }
    },
    onSettled: () => {
      userQueryUtils.invalidateLists(queryClient)
    },
    onSuccess: (response, variables, context) => {
      options?.onSuccess?.(response, variables, context)
    },
    onError: (error, variables, context) => {
      options?.onError?.(error, variables, context)
    },
  })
}

// 사용자 삭제
export function useDeleteUser(
  options?: Pick<UseMutationOptions<DeleteUserResponse, ApiError, DeleteUserParams>, "onSuccess" | "onError">,
) {
  const queryClient = useQueryClient()

  return useBaseMutation<DeleteUserResponse, ApiError, DeleteUserParams>({
    mutationFn: (data) => userApiService.deleteUser(...data),
    queryKey: userKeys.lists().queryKey,
    successMessage: "사용자가 성공적으로 삭제되었습니다.",
    onSuccess: (response, data, context) => {
      userQueryUtils.invalidateDetail(queryClient, data[0].id)
      userQueryUtils.invalidateLists(queryClient)
      options?.onSuccess?.(response, data, context)
    },
    onError: (error, variables, context) => {
      options?.onError?.(error, variables, context)
    },
  })
}

// // 프로필 업데이트 (현재 사용자)
// export function useUpdateProfile(config?: MutationConfig) {
//   const queryClient = useQueryClient()
//   const optimisticUpdate = createOptimisticUpdate<UpdateUserResponse, UpdateUserRequestData>(queryClient)

//   return useBaseMutation<UpdateUserResponse, ApiError, UpdateUserParams>({
//     mutationFn: (data) => userApiService.updateUser(...data),
//     queryKey: userKeys.profile("me").queryKey,
//     successMessage: "프로필이 성공적으로 수정되었습니다.",
//     onMutate: (data, previousData) => {
//       optimisticUpdate(userKeys.profile("me").queryKey, data[0].updateUserRequestDto, previousData)
//       return { previousData }
//     },
//     onSuccess: (response) => {
//       config?.onSuccess?.(response.data)
//     },
//     onError: (error) => {
//       config?.onError?.(error)
//     },
//   })
// }

// // 사용자 활성화/비활성화
// export function useToggleUserStatus(config?: MutationConfig) {
//   const queryClient = useQueryClient()

//   return useBaseMutation<
//     UserApiServiceMethodReturnType<"updateUser">,
//     ApiError,
//     UserApiServiceMethodParameters<"updateUser">
//   >({
//     mutationFn: (data) => userApiService.updateUser(...data),
//     queryKey: userKeys.all.queryKey,
//     onSuccess: (response, data) => {
//       const status = data[0].updateUserRequestDto.status
//       const statusText = status === "ACTIVE" ? "활성화" : "비활성화"
//       toast.success(`사용자가 성공적으로 ${statusText}되었습니다.`)
//       userQueryUtils.invalidateLists(queryClient)
//       userQueryUtils.invalidateDetail(queryClient, data[0].id)
//       config?.onSuccess?.(response.data)
//     },
//     onError: (error) => {
//       config?.onError?.(error)
//     },
//   })
// }
