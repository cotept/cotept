import { QueryKey, useMutation, UseMutationOptions, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

/**
 * @typeParam TData - 뮤테이션 함수의 반환 타입
 * @typeParam TError - 에러 타입
 * @typeParam TVariables - 뮤테이션 함수에 전달되는 변수 타입
 * @typeParam TContext - onMutate에서 반환되어 다른 콜백으로 전달되는 컨텍스트 타입
 */
interface BaseMutationOptions<TData, TError, TVariables, TContext>
  extends Omit<UseMutationOptions<TData, TError, TVariables, TContext>, "onSuccess" | "onError" | "onSettled"> {
  /** 각 뮤테이션을 식별하고 관련 쿼리를 관리하기 위한 필수 키 */
  queryKey: QueryKey

  /** 뮤테이션 성공 시 표시될 메시지 */
  successMessage?: string

  /** 뮤테이션 실패 시 표시될 메시지. 제공되지 않으면 서버 에러 메시지나 기본 메시지가 사용됩니다. */
  errorMessage?: string

  /** UseMutationOptions의 콜백들을 그대로 받아서 사용 */
  onSuccess?: (data: TData, variables: TVariables, context: TContext | undefined) => void
  onError?: (error: TError, variables: TVariables, context: TContext | undefined) => void
  onSettled?: (
    data: TData | undefined,
    error: TError | null,
    variables: TVariables,
    context: TContext | undefined,
  ) => void
  onMutate?: (variables: TVariables) => Promise<TContext | undefined> | TContext | undefined
}

/**
 * 공통 로직(성공/에러 토스트, 쿼리 무효화, 낙관적 업데이트 롤백)을 처리하는 useMutation의 래퍼 훅입니다.
 * 
 * @param options - useMutation 옵션과 추가적인 공통 옵션을 포함합니다.
 * @returns React Query의 useMutation 훅에서 반환하는 것과 동일한 값을 반환합니다.
 *
 * @example
 * // 기본 사용법 (생성)
 * const createUser = useBaseMutation({
 *   mutationFn: (newUser) => api.users.create(newUser),
 *   queryKey: userKeys.lists().queryKey,
 *   successMessage: '사용자가 생성되었습니다.',
 * });
 *
 * // 낙관적 업데이트 사용법 (수정)
 * const updateUser = useBaseMutation({
 *   mutationFn: (updatedUser) => api.users.update(updatedUser.id, updatedUser),
 *   queryKey: userKeys.detail(userId).queryKey,
 *   successMessage: '사용자가 수정되었습니다.',
 *   onMutate: (updatedUser) => {
 *     // 낙관적 업데이트 로직
 *   }
 * });
 */
export function useBaseMutation<TData = unknown, TError = unknown, TVariables = unknown, TContext = unknown>(
  options: BaseMutationOptions<TData, TError, TVariables, TContext>,
) {
  const queryClient = useQueryClient()

  return useMutation({
    ...options, // mutationFn 등 나머지 옵션들을 그대로 전달

    onMutate: async (variables: TVariables) => {
      // 기존 쿼리 취소
      await queryClient.cancelQueries({ queryKey: options.queryKey })
      // 이전 데이터 스냅샷
      const previousData = queryClient.getQueryData(options.queryKey)
      // 사용자가 정의한 onMutate 실행 (e.g., optimistic update 로직)
      const context = options.onMutate ? await options.onMutate(variables) : undefined
      // 이전 데이터와 사용자 정의 context를 함께 반환
      return { previousData, ...((context as object) ?? {}) } as TContext
    },

    onSuccess: (data, variables, context) => {
      // 성공 메시지가 있으면 toast로 표시
      if (options.successMessage) {
        toast.success(options.successMessage)
      }
      // 원래 onSuccess 콜백 실행
      options.onSuccess?.(data, variables, context)
    },

    onError: (error: TError, variables, context: any) => {
      // onMutate에서 스냅샷한 데이터로 롤백
      if (context?.previousData) {
        queryClient.setQueryData(options.queryKey, context.previousData)
      }
      // 에러 메시지가 있으면 toast로 표시
      const message = (error as any)?.message || options.errorMessage || "오류가 발생했습니다."
      toast.error(message)

      options.onError?.(error, variables, context)
    },

    onSettled: (data, error, variables, context) => {
      // 뮤테이션이 성공하든 실패하든 항상 실행  쿼리 무효화로 서버 데이터와 동기화
      queryClient.invalidateQueries({ queryKey: options.queryKey })

      // 원래 onSettled 콜백 실행
      options.onSettled?.(data, error, variables, context)
    },
  })
}
