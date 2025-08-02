import { useQueryClient } from "@tanstack/react-query"

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

import { ApiError, MutationConfig } from "@/shared/api/core/types"
import { userApiService } from "@/shared/api/services/user-api-service"
import { useBaseMutation } from "@/shared/hooks/useBaseMutation"
import { createOptimisticUpdate } from "@/shared/utils"

// 사용자 생성
export function useCreateUser(config?: MutationConfig) {
  const queryClient = useQueryClient()

  return useBaseMutation<CreateUserResponse, ApiError, CreateUserParams>({
    mutationFn: (data) => userApiService.createUser(...data),
    queryKey: userKeys.lists().queryKey,
    successMessage: "사용자가 성공적으로 생성되었습니다.",
    onSuccess: (response) => {
      userQueryUtils.invalidateLists(queryClient)
      config?.onSuccess?.(response.data)
    },
    onError: (error) => {
      config?.onError?.(error)
    },
  })
}

// 사용자 정보 수정 (Optimistic Update)
export function useUpdateUser(id: string, config?: MutationConfig) {
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
    onSuccess: (response) => {
      config?.onSuccess?.(response.data)
    },
    onError: (error) => {
      config?.onError?.(error)
    },
  })
}

// 사용자 삭제
export function useDeleteUser(config?: MutationConfig) {
  const queryClient = useQueryClient()

  return useBaseMutation<DeleteUserResponse, ApiError, DeleteUserParams>({
    mutationFn: (data) => userApiService.deleteUser(...data),
    queryKey: userKeys.lists().queryKey,
    successMessage: "사용자가 성공적으로 삭제되었습니다.",
    onSuccess: (response, data) => {
      userQueryUtils.invalidateDetail(queryClient, data[0].id)
      userQueryUtils.invalidateLists(queryClient)
      config?.onSuccess?.(response.data)
    },
    onError: (error) => {
      config?.onError?.(error)
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
