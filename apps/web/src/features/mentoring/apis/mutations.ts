import { useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { userService } from "./client/service"
import { queryKeys } from "./queryKeyFactory"

import { ApiError, CreateUserRequest, MutationConfig, UpdateUserRequest } from "@/shared/api/core/types"
import { useBaseMutation } from "@/shared/hooks/useBaseMutation"

// 사용자 생성
export function useCreateUser(config?: MutationConfig) {
  return useBaseMutation({
    mutationFn: (data: CreateUserRequest) => userService.createUser(data),
    queryKey: queryKeys.users.lists().queryKey,
    successMessage: "사용자가 성공적으로 생성되었습니다.",
    onSuccess: (response) => {
      config?.onSuccess?.(response.data)
    },
    onError: (error: ApiError) => {
      config?.onError?.(error)
    },
  })
}

// 사용자 정보 수정 (Optimistic Update)
export function useUpdateUser(id: string, config?: MutationConfig) {
  const queryClient = useQueryClient()

  return useBaseMutation({
    mutationFn: (data: UpdateUserRequest) => userService.updateUser(id, data),
    queryKey: queryKeys.users.detail(id).queryKey,
    successMessage: "사용자 정보가 성공적으로 수정되었습니다.",
    onMutate: (data: UpdateUserRequest) => {
      // Optimistic Update 로직
      queryClient.setQueryData(queryKeys.users.detail(id).queryKey, (old: any) =>
        old ? { ...old, data: { ...old.data, ...data } } : undefined,
      )
    },
    onSettled: () => {
      // 상세 정보와 목록 모두 무효화
      queryClient.invalidateQueries({ queryKey: queryKeys.users.lists().queryKey })
    },
    onSuccess: (response) => {
      config?.onSuccess?.(response.data)
    },
    onError: (error: ApiError) => {
      config?.onError?.(error)
    },
  })
}

// 사용자 삭제
export function useDeleteUser(config?: MutationConfig) {
  const queryClient = useQueryClient()

  return useBaseMutation({
    mutationFn: (id: string) => userService.deleteUser(id),
    queryKey: queryKeys.users.lists().queryKey, // 목록을 무효화하기 위한 키
    successMessage: "사용자가 성공적으로 삭제되었습니다.",
    onSuccess: (response, deletedId) => {
      // 삭제된 사용자의 상세 쿼리 캐시를 직접 제거
      queryClient.removeQueries({
        queryKey: queryKeys.users.detail(deletedId).queryKey,
      })
      config?.onSuccess?.(response.data)
    },
    onError: (error: ApiError) => {
      config?.onError?.(error)
    },
  })
}

// 프로필 업데이트 (현재 사용자)
export function useUpdateProfile(config?: MutationConfig) {
  const queryClient = useQueryClient()

  return useBaseMutation({
    mutationFn: (data: UpdateUserRequest) => userService.updateUser("me", data),
    queryKey: queryKeys.users.profile("me").queryKey,
    successMessage: "프로필이 성공적으로 수정되었습니다.",
    onMutate: (data: UpdateUserRequest) => {
      // Optimistic Update
      queryClient.setQueryData(queryKeys.users.profile("me").queryKey, (old: any) =>
        old ? { ...old, data: { ...old.data, ...data } } : undefined,
      )
    },
    onSuccess: (response) => {
      config?.onSuccess?.(response.data)
    },
    onError: (error: ApiError) => {
      config?.onError?.(error)
    },
  })
}

// 사용자 활성화/비활성화
export function useToggleUserStatus(config?: MutationConfig) {
  const queryClient = useQueryClient()

  return useBaseMutation({
    mutationFn: ({ id, status }: { id: string; status: "ACTIVE" | "SUSPENDED" }) =>
      userService.updateUser(id, { status } as any),
    queryKey: queryKeys.users.all.queryKey, // users 관련 모든 쿼리를 무효화
    onSuccess: (response, variables) => {
      const statusText = variables.status === "ACTIVE" ? "활성화" : "비활성화"
      toast.success(`사용자가 성공적으로 ${statusText}되었습니다.`)

      // 목록과 상세 뷰를 모두 확실하게 무효화
      queryClient.invalidateQueries({ queryKey: queryKeys.users.lists().queryKey })
      queryClient.invalidateQueries({ queryKey: queryKeys.users.detail(variables.id).queryKey })

      config?.onSuccess?.(response.data)
    },
    onError: (error: ApiError) => {
      config?.onError?.(error)
    },
  })
}

// 사용자 일괄 삭제
export function useBulkDeleteUsers(config?: MutationConfig) {
  const queryClient = useQueryClient()

  return useBaseMutation({
    mutationFn: async (userIds: string[]) => {
      const deletePromises = userIds.map((id) => userService.deleteUser(id))
      return Promise.all(deletePromises)
    },
    queryKey: queryKeys.users.lists().queryKey,
    onSuccess: (responses, deletedIds) => {
      // 삭제된 사용자들의 상세 쿼리 캐시를 제거
      deletedIds.forEach((id) => {
        queryClient.removeQueries({
          queryKey: queryKeys.users.detail(id).queryKey,
        })
      })
      toast.success(`${deletedIds.length}명의 사용자가 성공적으로 삭제되었습니다.`)
      config?.onSuccess?.(responses)
    },
    onError: (error: ApiError) => {
      config?.onError?.(error)
    },
  })
}
