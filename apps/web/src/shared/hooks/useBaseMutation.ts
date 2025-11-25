import { QueryKey, useMutation, UseMutationOptions, useQueryClient } from "@tanstack/react-query"

import { ApiErrorHandler } from "@/shared/api/core/errors/handlers"

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

  /**
   * Error Boundary로 에러를 전파할지 여부
   * - true: 모든 에러를 Error Boundary로 전파
   * - false: 에러를 로컬에서 처리 (기본값)
   * - (error) => boolean: 특정 조건의 에러만 전파
   */
  throwOnError?: boolean | ((error: TError) => boolean)
}

/**
 * React Query 보일러플레이트를 제거하는 useMutation 래퍼 훅
 *
 * 책임:
 * - 쿼리 무효화 자동 처리
 * - 에러 변환 및 로깅
 * - Error Boundary 전파 제어
 *
 * UI 표시는 커스텀훅에서 처리 (토스트, 모달 등)
 *
 * @example
 * // 기본 사용
 * const createUser = useBaseMutation({
 *   mutationFn: (newUser) => api.users.create(newUser),
 *   invalidateKeys: [['users']],
 *   onSuccess: (data) => {
 *     toast.success('사용자가 생성되었습니다.')  // UI는 여기서
 *   },
 *   onError: (error) => {
 *     toast.error(error.message)  // UI는 여기서
 *   }
 * })
 *
 * @example
 * // Error Boundary 전파
 * const fetchCriticalData = useBaseMutation({
 *   mutationFn: (id) => api.critical.fetch(id),
 *   throwOnError: (error) => error.statusCode >= 500,  // 5xx만 전파
 * })
 */
export function useBaseMutation<TData = unknown, TError = unknown, TVariables = unknown, TContext = unknown>(
  options: UseBaseMutationOptions<TData, TError, TVariables, TContext>,
) {
  const queryClient = useQueryClient()

  const { invalidateKeys, throwOnError: shouldThrow, onError, onSettled, ...mutationOptions } = options

  return useMutation({
    ...mutationOptions,

    onError: (error: TError, variables, context) => {
      // 에러 변환 및 로깅
      const processedError = ApiErrorHandler.process(error)
      ApiErrorHandler.logError(processedError, "Mutation")

      // 사용자 onError 콜백 실행 (UI 처리는 여기서)
      onError?.(processedError as TError, variables, context)

      // Error Boundary로 전파 여부 결정
      if (shouldThrow) {
        const shouldThrowError = typeof shouldThrow === "function" ? shouldThrow(error) : shouldThrow
        if (shouldThrowError) {
          throw error
        }
      }
    },

    onSettled: (data, error, variables, context) => {
      // 지정된 쿼리 무효화
      if (invalidateKeys) {
        invalidateKeys.forEach((queryKey) => {
          queryClient.invalidateQueries({ queryKey })
        })
      }

      // 사용자 onSettled 콜백 실행
      onSettled?.(data, error, variables, context)
    },
  })
}
