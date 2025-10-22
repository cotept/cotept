import { QueryKey, useMutation, UseMutationOptions, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { ApiErrorHandler } from "@/shared/api/core/errors/handlers"
import { ErrorType } from "@/shared/api/core/types"

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

  /**
   * 에러 toast 표시 전략
   * - 'auto': 자동으로 처리 (기본값). axios interceptor에서 처리 안 된 에러만 toast
   * - 'always': 항상 toast 표시 (interceptor와 중복 가능)
   * - 'never': toast 표시 안 함 (onError에서 직접 처리)
   * - 'custom': errorMessage가 제공된 경우만 toast 표시
   */
  showErrorToast?: "auto" | "always" | "never" | "custom"

  /**
   * Error Boundary로 에러를 전파할지 여부
   * - true: 모든 에러를 Error Boundary로 전파
   * - false: 에러를 로컬에서 처리 (기본값)
   * - (error) => boolean: 특정 조건의 에러만 전파
   */
  throwOnError?: boolean | ((error: TError) => boolean)
}

/**
 * 공통 로직(성공/에러 토스트, 쿼리 무효화)을 처리하는 useMutation의 래퍼 훅입니다.
 *
 * @example
 * // 기본 사용법 - auto 전략 (interceptor에서 처리 안 된 에러만 toast)
 * const createUser = useBaseMutation({
 *   mutationFn: (newUser) => api.users.create(newUser),
 *   invalidateKeys: [userKeys.lists().queryKey],
 *   successMessage: '사용자가 생성되었습니다.',
 * });
 *
 * // 커스텀 에러 메시지 - custom 전략
 * const updateUser = useBaseMutation({
 *   mutationFn: (user) => api.users.update(user),
 *   errorMessage: '사용자 정보 업데이트에 실패했습니다.',
 *   showErrorToast: 'custom', // errorMessage만 표시
 * });
 *
 * // Toast 표시 안 함 - 직접 처리
 * const deleteUser = useBaseMutation({
 *   mutationFn: (id) => api.users.delete(id),
 *   showErrorToast: 'never',
 *   onError: (error) => {
 *     // 커스텀 에러 처리
 *     console.error('삭제 실패:', error)
 *   },
 * });
 *
 * // Error Boundary로 전파 - 5xx 에러만
 * const fetchCriticalData = useBaseMutation({
 *   mutationFn: (id) => api.critical.fetch(id),
 *   throwOnError: (error) => {
 *     const processed = ApiErrorHandler.process(error)
 *     return processed.type === ErrorType.SERVER_ERROR
 *   },
 * });
 */
export function useBaseMutation<TData = unknown, TError = unknown, TVariables = unknown, TContext = unknown>(
  options: UseBaseMutationOptions<TData, TError, TVariables, TContext>,
) {
  const queryClient = useQueryClient()

  const {
    invalidateKeys,
    successMessage,
    errorMessage,
    showErrorToast = "auto",
    throwOnError: shouldThrow,
    onSuccess,
    onError,
    onSettled,
    ...mutationOptions
  } = options

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
      const processedError = ApiErrorHandler.process(error)

      // 에러 toast 표시 전략에 따라 처리
      const shouldShowToast = (() => {
        switch (showErrorToast) {
          case "always":
            return true
          case "never":
            return false
          case "custom":
            return !!errorMessage
          case "auto":
          default:
            // axios interceptor에서 이미 처리한 에러는 toast 안 띄움
            // 네트워크, 5xx, 403 에러는 interceptor에서 처리됨
            return ![ErrorType.NETWORK_ERROR, ErrorType.SERVER_ERROR, ErrorType.AUTHORIZATION_ERROR].includes(
              processedError.type,
            )
        }
      })()

      if (shouldShowToast) {
        const message = errorMessage || processedError.message
        toast.error(message)
      }

      // 로그 기록
      ApiErrorHandler.logError(processedError, "Mutation")

      // 원래 onError 콜백 실행
      onError?.(error, variables, context)

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

      // 원래 onSettled 콜백 실행
      onSettled?.(data, error, variables, context)
    },
  })
}

// 사용 예시
// 1. 기본 사용 (auto 전략)

// typescript
// // axios interceptor가 5xx, 403을 이미 처리했으므로
// // 401, 400, 409 같은 에러만 여기서 toast
// const createPost = useBaseMutation({
//   mutationFn: (post) => postsApi.create(post),
//   successMessage: '게시글이 생성되었습니다.',
//   invalidateKeys: [['posts']],
// })
// 2. 커스텀 메시지 (custom 전략)

// typescript
// // errorMessage가 있을 때만 toast 표시
// const updateProfile = useBaseMutation({
//   mutationFn: (profile) => userApi.updateProfile(profile),
//   errorMessage: '프로필 업데이트에 실패했습니다. 다시 시도해주세요.',
//   showErrorToast: 'custom',
//   onError: (error) => {
//     // 추가적인 에러 처리
//     console.log('에러 상세:', error)
//   },
// })
// 3. Toast 표시 안 함 (never 전략)

// typescript
// // 폼 검증 실패는 필드 옆에 에러 메시지 표시
// const submitForm = useBaseMutation({
//   mutationFn: (formData) => formApi.submit(formData),
//   showErrorToast: 'never',
//   onError: (error) => {
//     const processed = ApiErrorHandler.process(error)
//     if (processed.type === ErrorType.VALIDATION_ERROR) {
//       // 폼 에러 상태 업데이트
//       setFieldErrors(processed.originalError)
//     }
//   },
// })
// 4. 항상 toast (always 전략)

// typescript
// // interceptor와 중복되어도 상관없이 항상 표시
// const deleteUser = useBaseMutation({
//   mutationFn: (id) => userApi.delete(id),
//   errorMessage: '사용자 삭제에 실패했습니다.',
//   showErrorToast: 'always',
// })
// 5. Error Boundary 활용

// typescript
// // 5xx 에러는 Error Boundary로, 나머지는 로컬 처리
// const fetchCriticalData = useBaseMutation({
//   mutationFn: (id) => criticalApi.fetch(id),
//   throwOnError: (error) => {
//     const processed = ApiErrorHandler.process(error)
//     return processed.type === ErrorType.SERVER_ERROR
//   },
// })
// 6. 낙관적 업데이트 + 에러 처리

// typescript
// const updateTodo = useBaseMutation({
//   mutationFn: (todo) => todosApi.update(todo.id, todo),
//   showErrorToast: 'auto',
//   onMutate: async (variables) => {
//     await queryClient.cancelQueries({ queryKey: ['todos'] })
//     const previousTodos = queryClient.getQueryData(['todos'])

//     // 낙관적 업데이트
//     queryClient.setQueryData(['todos'], (old) =>
//       old.map((t) => (t.id === variables.id ? variables : t))
//     )

//     return { previousTodos }
//   },
//   onError: (error, variables, context) => {
//     // 롤백
//     if (context?.previousTodos) {
//       queryClient.setQueryData(['todos'], context.previousTodos)
//     }
//   },
//   invalidateKeys: [['todos']],
// })
