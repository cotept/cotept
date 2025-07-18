import { useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { userService } from "./client/service"
import { queryKeys } from "./queryKeyFactory"

import {
  ApiError,
  ApiResponse,
  CreateUserRequest,
  MutationConfig,
  UpdateUserRequest,
  User,
} from "@/shared/api/core/types"
import { useBaseMutation } from "@/shared/hooks/useBaseMutation"
import { createImmerApiDataUpdater } from "@/shared/utils"

// 사용자 생성
export function useCreateUser(config?: MutationConfig) {
  return useBaseMutation<ApiResponse<User>, ApiError, CreateUserRequest>({
    mutationFn: (data) => userService.createUser(data),
    queryKey: queryKeys.users.lists().queryKey,
    successMessage: "사용자가 성공적으로 생성되었습니다.",
    onSuccess: (response) => {
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

  return useBaseMutation<ApiResponse<User>, ApiError, UpdateUserRequest>({
    mutationFn: (data) => userService.updateUser(id, data),
    queryKey: queryKeys.users.detail(id).queryKey,
    successMessage: "사용자 정보가 성공적으로 수정되었습니다.",
    onMutate: (data, previousData) => {
      queryClient.setQueryData<ApiResponse<User> | undefined>(
        queryKeys.users.detail(id).queryKey,
        createImmerApiDataUpdater<User, UpdateUserRequest>(data),
      )
      return { previousData }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.lists().queryKey })
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

  return useBaseMutation<ApiResponse<void>, ApiError, string>({
    mutationFn: (id) => userService.deleteUser(id),
    queryKey: queryKeys.users.lists().queryKey,
    successMessage: "사용자가 성공적으로 삭제되었습니다.",
    onSuccess: (response, deletedId) => {
      queryClient.removeQueries({ queryKey: queryKeys.users.detail(deletedId).queryKey })
      config?.onSuccess?.(response.data)
    },
    onError: (error) => {
      config?.onError?.(error)
    },
  })
}

// 프로필 업데이트 (현재 사용자)
export function useUpdateProfile(config?: MutationConfig) {
  const queryClient = useQueryClient()

  return useBaseMutation<ApiResponse<User>, ApiError, UpdateUserRequest>({
    mutationFn: (data) => userService.updateUser("me", data),
    queryKey: queryKeys.users.profile("me").queryKey,
    successMessage: "프로필이 성공적으로 수정되었습니다.",
    onMutate: (data, previousData) => {
      queryClient.setQueryData<ApiResponse<User> | undefined>(
        queryKeys.users.profile("me").queryKey,
        createImmerApiDataUpdater<User, UpdateUserRequest>(data),
      )
      return { previousData }
    },
    onSuccess: (response) => {
      config?.onSuccess?.(response.data)
    },
    onError: (error) => {
      config?.onError?.(error)
    },
  })
}

// 사용자 활성화/비활성화
export function useToggleUserStatus(config?: MutationConfig) {
  const queryClient = useQueryClient()

  return useBaseMutation<ApiResponse<User>, ApiError, { id: string; status: "ACTIVE" | "SUSPENDED" }>({
    mutationFn: ({ id, status }) => userService.updateUser(id, { status } as any),
    queryKey: queryKeys.users.all.queryKey,
    onSuccess: (response, variables) => {
      const statusText = variables.status === "ACTIVE" ? "활성화" : "비활성화"
      toast.success(`사용자가 성공적으로 ${statusText}되었습니다.`)
      queryClient.invalidateQueries({ queryKey: queryKeys.users.lists().queryKey })
      queryClient.invalidateQueries({ queryKey: queryKeys.users.detail(variables.id).queryKey })
      config?.onSuccess?.(response.data)
    },
    onError: (error) => {
      config?.onError?.(error)
    },
  })
}

// 사용자 일괄 삭제
export function useBulkDeleteUsers(config?: MutationConfig) {
  const queryClient = useQueryClient()

  return useBaseMutation<ApiResponse<void>[], ApiError, string[]>({
    mutationFn: async (userIds) => {
      const deletePromises = userIds.map((id) => userService.deleteUser(id))
      return Promise.all(deletePromises)
    },
    queryKey: queryKeys.users.lists().queryKey,
    onSuccess: (responses, deletedIds) => {
      deletedIds.forEach((id) => {
        queryClient.removeQueries({ queryKey: queryKeys.users.detail(id).queryKey })
      })
      toast.success(`${deletedIds.length}명의 사용자가 성공적으로 삭제되었습니다.`)
      config?.onSuccess?.(responses)
    },
    onError: (error) => {
      config?.onError?.(error)
    },
  })
}
