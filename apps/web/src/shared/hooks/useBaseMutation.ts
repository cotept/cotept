import { QueryKey, useMutation, UseMutationOptions, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

/**
 * @typeParam TData - 뮤테이션 함수의 반환 타입
 * @typeParam TError - 에러 타입
 * @typeParam TVariables - 뮤테이션 함수에 전달되는 변수 타입
 * @typeParam TContext - onMutate에서 반환되어 다른 콜백으로 전달되는 컨텍스트 타입
 */
interface UseBaseMutationOptions<TData, TError, TVariables, TContext = unknown>
  extends UseMutationOptions<TData, TError, TVariables, TContext> {
  /** 뮤테이션 성공 시 무효화할 쿼리 키 배열 */
  invalidateKeys?: QueryKey[]

  /** 뮤테이션 성공 시 표시될 메시지 */
  successMessage?: string

  /** 뮤테이션 실패 시 표시될 메시지. 제공되지 않으면 서버 에러 메시지나 기본 메시지가 사용됩니다. */
  errorMessage?: string
}

/**
 * 공통 로직(성공/에러 토스트, 쿼리 무효화)을 처리하는 useMutation의 래퍼 훅입니다.
 * 일반 useMutation과 동일한 시그니처로 사용 가능하며, invalidateKeys만 추가로 전달하면 됩니다.
 *
 * @param options - useMutation 옵션과 추가적인 공통 옵션을 포함합니다.
 * @returns React Query의 useMutation 훅에서 반환하는 것과 동일한 값을 반환합니다.
 *
 * @example
 * // 기본 사용법 (일반 useMutation과 동일)
 * const createUser = useBaseMutation({
 *   mutationFn: (newUser) => api.users.create(newUser),
 *   invalidateKeys: [userKeys.lists().queryKey],
 *   successMessage: '사용자가 생성되었습니다.',
 *   onSuccess: (data) => {
 *     console.log('성공!', data)
 *   }
 * });
 *
 * // 복잡한 사용법 (낙관적 업데이트)
 * const updateUser = useBaseMutation({
 *   mutationFn: (updatedUser) => api.users.update(updatedUser.id, updatedUser),
 *   invalidateKeys: [userKeys.detail(userId).queryKey],
 *   successMessage: '사용자가 수정되었습니다.',
 *   onMutate: async (variables) => {
 *     await queryClient.cancelQueries({ queryKey: userKeys.detail(userId).queryKey })
 *     const previousData = queryClient.getQueryData(userKeys.detail(userId).queryKey)
 *     queryClient.setQueryData(userKeys.detail(userId).queryKey, (old) =>
 *       old ? { ...old, name: variables.name } : undefined
 *     )
 *     return { previousData }
 *   },
 *   onError: (err, variables, context) => {
 *     if (context?.previousData) {
 *       queryClient.setQueryData(userKeys.detail(userId).queryKey, context.previousData)
 *     }
 *   }
 * });
 */
export function useBaseMutation<TData = unknown, TError = unknown, TVariables = unknown, TContext = unknown>(
  options: UseBaseMutationOptions<TData, TError, TVariables, TContext>,
) {
  const queryClient = useQueryClient()

  const { invalidateKeys, successMessage, errorMessage, onSuccess, onError, onSettled, ...mutationOptions } = options

  return useMutation({
    ...mutationOptions,

    onSuccess: (data, variables, context) => {
      // 성공 메시지 표시
      if (successMessage) {
        toast.success(successMessage)
      }

      // 원래 onSuccess 콜백 실행
      onSuccess?.(data, variables, context)
    },

    onError: (error: TError, variables, context) => {
      // 에러 메시지 표시
      const message = (error as any)?.message || errorMessage || "오류가 발생했습니다."
      toast.error(message)

      // 원래 onError 콜백 실행
      onError?.(error, variables, context)
    },

    onSettled: (data, error, variables, context) => {
      // 지정된 쿼리 무효화
      if (invalidateKeys) {
        invalidateKeys.forEach((queryKey) => {
          queryClient.invalidateQueries({ queryKey })
        })
      }

      // 원래 onSettled 콜백 실행
      onSettled?.(data, error, variables, context)
    },
  })
}
