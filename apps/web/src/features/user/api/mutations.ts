import {
  type UserApiCreateUserRequest,
  type UserApiDeleteUserRequest,
  type UserApiUpdateUserRequest,
  type UserDeletionResponseWrapper,
  type UserResponse,
} from "@repo/api-client"

import { useMutation, type UseMutationOptions, useQueryClient } from "@tanstack/react-query"

import { userKeys } from "./queryKey"

import { ApiError } from "@/shared/api/core/types"
import { userApiService } from "@/shared/api/services/user-api-service"
import { useBaseMutation } from "@/shared/hooks/useBaseMutation"

// 회원가입 (토스트 없음 - Fat Hook에서 처리)
export function useSignupUser(options?: UseMutationOptions<UserResponse, ApiError, UserApiCreateUserRequest>) {
  return useMutation<UserResponse, ApiError, UserApiCreateUserRequest>({
    mutationFn: (data) => userApiService.createUser({ ...data }),
    ...options,
  })
}

// 사용자 생성 (관리자용)
export function useCreateUser(options?: UseMutationOptions<UserResponse, ApiError, UserApiCreateUserRequest>) {
  return useBaseMutation<UserResponse, ApiError, UserApiCreateUserRequest>({
    mutationFn: (data) => userApiService.createUser({ ...data }),
    invalidateKeys: [userKeys.lists().queryKey],
    successMessage: "사용자가 성공적으로 생성되었습니다.",
    ...options,
  })
}

// 사용자 정보 수정 (Optimistic Update)
export function useUpdateUser(
  id: string,
  options?: UseMutationOptions<UserResponse, ApiError, UserApiUpdateUserRequest, { previousData?: UserResponse }>,
) {
  const queryClient = useQueryClient()

  return useBaseMutation<UserResponse, ApiError, UserApiUpdateUserRequest, { previousData?: UserResponse }>({
    mutationFn: (data) => userApiService.updateUser({ ...data }),
    invalidateKeys: [userKeys.detail(id).queryKey, userKeys.lists().queryKey],
    successMessage: "사용자 정보가 성공적으로 수정되었습니다.",
    onMutate: async (variables) => {
      // 기존 쿼리 취소
      await queryClient.cancelQueries({ queryKey: userKeys.detail(id).queryKey })

      // 이전 데이터 스냅샷
      const previousData = queryClient.getQueryData<UserResponse>(userKeys.detail(id).queryKey)

      // 낙관적 업데이트 (updateUserRequestDto의 필드만 업데이트)
      if (previousData?.data) {
        queryClient.setQueryData<UserResponse>(userKeys.detail(id).queryKey, {
          ...previousData,
          data: {
            ...previousData.data,
            ...variables.updateUserRequestDto,
          },
        })
      }

      return { previousData }
    },
    onError: (_err, _variables, context) => {
      // 롤백
      if (context?.previousData) {
        queryClient.setQueryData(userKeys.detail(id).queryKey, context.previousData)
      }
    },
    ...options,
  })
}

// 사용자 삭제
export function useDeleteUser(
  options?: UseMutationOptions<UserDeletionResponseWrapper, ApiError, UserApiDeleteUserRequest>,
) {
  const queryClient = useQueryClient()

  return useBaseMutation<UserDeletionResponseWrapper, ApiError, UserApiDeleteUserRequest>({
    mutationFn: (data) => userApiService.deleteUser({ ...data }),
    invalidateKeys: [
      userKeys.lists().queryKey,
      // 삭제된 사용자의 detail도 무효화 (onSuccess에서 idx 접근 가능)
    ],
    successMessage: "사용자가 성공적으로 삭제되었습니다.",
    onSuccess: (_response, variables) => {
      // 특정 사용자 detail 쿼리도 무효화
      queryClient.invalidateQueries({ queryKey: userKeys.detail(variables.idx.toString()).queryKey })
    },
    ...options,
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
