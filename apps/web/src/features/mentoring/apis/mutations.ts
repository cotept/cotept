import { MutationConfig, CreateUserRequest, UpdateUserRequest, ApiError } from "@/shared/api/core/types"
import { useMutation, useQueryClient, UseMutationOptions } from "@tanstack/react-query"
import { userService } from "./client/service"
import { queryKeys } from "./queryKeyFactory"
import { toast } from "@repo/shared/components/sonner"

// 사용자 생성
export function useCreateUser(config?: MutationConfig) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateUserRequest) => userService.createUser(data),
    onSuccess: (response) => {
      // 사용자 목록 쿼리 무효화
      queryClient.invalidateQueries({
        queryKey: queryKeys.users.lists().queryKey,
      })

      toast.success("사용자가 성공적으로 생성되었습니다.")
      config?.onSuccess?.(response.data)
    },
    onError: (error: ApiError) => {
      toast.error(error.message || "사용자 생성에 실패했습니다.")
      config?.onError?.(error)
    },
  })
}

// 사용자 정보 수정 (Optimistic Update)
export function useUpdateUser(config?: MutationConfig) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserRequest }) => userService.updateUser(id, data),
    onMutate: async ({ id, data }) => {
      // 진행 중인 쿼리 취소
      await queryClient.cancelQueries({
        queryKey: queryKeys.users.detail(id).queryKey,
      })

      // 이전 데이터 스냅샷
      const previousUser = queryClient.getQueryData(queryKeys.users.detail(id).queryKey)

      // Optimistic update
      queryClient.setQueryData(queryKeys.users.detail(id).queryKey, (old: any) =>
        old
          ? {
              ...old,
              data: { ...old.data, ...data },
            }
          : undefined,
      )

      return { previousUser, id }
    },
    onError: (error: ApiError, variables, context) => {
      // 롤백
      if (context?.previousUser) {
        queryClient.setQueryData(queryKeys.users.detail(context.id).queryKey, context.previousUser)
      }

      toast.error(error.message || "사용자 정보 수정에 실패했습니다.")
      config?.onError?.(error)
    },
    onSettled: (data, error, variables) => {
      // 관련 쿼리 무효화
      queryClient.invalidateQueries({
        queryKey: queryKeys.users.detail(variables.id).queryKey,
      })
      queryClient.invalidateQueries({
        queryKey: queryKeys.users.lists().queryKey,
      })
    },
    onSuccess: (response) => {
      toast.success("사용자 정보가 성공적으로 수정되었습니다.")
      config?.onSuccess?.(response.data)
    },
  })
}

// 사용자 삭제
export function useDeleteUser(config?: MutationConfig) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => userService.deleteUser(id),
    onSuccess: (response, deletedId) => {
      // 관련 쿼리 무효화
      queryClient.invalidateQueries({
        queryKey: queryKeys.users.lists().queryKey,
      })

      // 삭제된 사용자의 상세 쿼리 제거
      queryClient.removeQueries({
        queryKey: queryKeys.users.detail(deletedId).queryKey,
      })

      toast.success("사용자가 성공적으로 삭제되었습니다.")
      config?.onSuccess?.(response.data)
    },
    onError: (error: ApiError) => {
      toast.error(error.message || "사용자 삭제에 실패했습니다.")
      config?.onError?.(error)
    },
  })
}

// 프로필 업데이트 (현재 사용자)
export function useUpdateProfile(config?: MutationConfig) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UpdateUserRequest) => userService.updateUser("me", data),
    onMutate: async (data) => {
      // 진행 중인 쿼리 취소
      await queryClient.cancelQueries({
        queryKey: queryKeys.users.profile("me").queryKey,
      })

      // 이전 데이터 스냅샷
      const previousProfile = queryClient.getQueryData(queryKeys.users.profile("me").queryKey)

      // Optimistic update
      queryClient.setQueryData(queryKeys.users.profile("me").queryKey, (old: any) =>
        old
          ? {
              ...old,
              data: { ...old.data, ...data },
            }
          : undefined,
      )

      return { previousProfile }
    },
    onError: (error: ApiError, variables, context) => {
      // 롤백
      if (context?.previousProfile) {
        queryClient.setQueryData(queryKeys.users.profile("me").queryKey, context.previousProfile)
      }

      toast.error(error.message || "프로필 수정에 실패했습니다.")
      config?.onError?.(error)
    },
    onSettled: () => {
      // 프로필 쿼리 무효화
      queryClient.invalidateQueries({
        queryKey: queryKeys.users.profile("me").queryKey,
      })
    },
    onSuccess: (response) => {
      toast.success("프로필이 성공적으로 수정되었습니다.")
      config?.onSuccess?.(response.data)
    },
  })
}

// 사용자 활성화/비활성화
export function useToggleUserStatus(config?: MutationConfig) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: "ACTIVE" | "SUSPENDED" }) =>
      userService.updateUser(id, { status } as any),
    onSuccess: (response, variables) => {
      // 관련 쿼리 무효화
      queryClient.invalidateQueries({
        queryKey: queryKeys.users.detail(variables.id).queryKey,
      })
      queryClient.invalidateQueries({
        queryKey: queryKeys.users.lists().queryKey,
      })

      const statusText = variables.status === "ACTIVE" ? "활성화" : "비활성화"
      toast.success(`사용자가 성공적으로 ${statusText}되었습니다.`)
      config?.onSuccess?.(response.data)
    },
    onError: (error: ApiError) => {
      toast.error(error.message || "사용자 상태 변경에 실패했습니다.")
      config?.onError?.(error)
    },
  })
}

// 사용자 일괄 삭제
export function useBulkDeleteUsers(config?: MutationConfig) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (userIds: string[]) => {
      // 여러 삭제 요청을 병렬로 처리
      const deletePromises = userIds.map((id) => userService.deleteUser(id))
      return Promise.all(deletePromises)
    },
    onSuccess: (responses, deletedIds) => {
      // 관련 쿼리 무효화
      queryClient.invalidateQueries({
        queryKey: queryKeys.users.lists().queryKey,
      })

      // 삭제된 사용자들의 상세 쿼리 제거
      deletedIds.forEach((id) => {
        queryClient.removeQueries({
          queryKey: queryKeys.users.detail(id).queryKey,
        })
      })

      toast.success(`${deletedIds.length}명의 사용자가 성공적으로 삭제되었습니다.`)
      config?.onSuccess?.(responses)
    },
    onError: (error: ApiError) => {
      toast.error(error.message || "일괄 삭제에 실패했습니다.")
      config?.onError?.(error)
    },
  })
}
