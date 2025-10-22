import { GenerateUploadUrlResponseWrapper, StorageApiGenerateUploadUrlRequest } from "@repo/api-client/src"

import { useMutation, type UseMutationOptions } from "@tanstack/react-query"
import { toast } from "sonner"

import { ApiError } from "@/shared/api/core/types"
import { storageApiService } from "@/shared/api/services/storage-api-service"
import { AuthErrorHandler } from "@/shared/auth/errors/handler"

/**
 * 파일 업로드 URL 생성 (기본 useMutation 사용)
 */
export function useGetUploadUrl(
  options?: UseMutationOptions<GenerateUploadUrlResponseWrapper, ApiError, StorageApiGenerateUploadUrlRequest>,
) {
  // 옵션에서 onSuccess와 onError 콜백을 분리
  const { onSuccess, onError, ...restOptions } = options || {}

  return useMutation<GenerateUploadUrlResponseWrapper, ApiError, StorageApiGenerateUploadUrlRequest>({
    ...restOptions, // 나머지 옵션들(예: onMutate)을 전달
    mutationFn: (data) => storageApiService.generateUploadUrl({ ...data }),

    //  onSuccess 콜백을 직접 정의
    onSuccess: (data, variables, context) => {
      // 이 훅 자체의 기본 성공 로직은 없으므로,
      // 옵션으로 받은 onSuccess가 있다면 실행
      if (onSuccess) {
        onSuccess(data, variables, context)
      }
    },

    //  onError 콜백을 직접 정의
    onError: (error, variables, context) => {
      // 1. 훅의 기본 에러 처리 로직 (토스트 메시지)
      const handledError = AuthErrorHandler.handle(error)
      AuthErrorHandler.logError(handledError, "useGetUploadUrl")
      toast.error(handledError.message || "업로드 URL을 받아오는데 실패했습니다.")

      // 2. 옵션으로 받은 onError가 있다면 실행
      if (onError) {
        onError(error, variables, context)
      }
    },
  })
}
