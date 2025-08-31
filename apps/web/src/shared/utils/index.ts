import { QueryClient, QueryKey } from "@tanstack/react-query"
import { AxiosPromise } from "axios"
import { produce } from "immer"

import { handleApiError } from "@/shared/api/core/error-handler"

/**
 * Immer를 사용하여 T 형태의 캐시 데이터를 부분적으로 업데이트하기 위한
 * `queryClient.setQueryData`용 업데이터 함수를 생성합니다.
 * 이 함수는 ApiResponse의 `data` 속성 내의 데이터를 업데이트하는 데 특화되어 있습니다.
 *
 * @template T - ApiResponse의 `data` 속성 타입 (예: `User`, `Post`)
 * @template U - 업데이트할 부분 데이터의 타입 (예: `Partial<User>`, `UpdateUserRequest`)
 *
 * @param {U} updateData - 캐시의 `data` 속성에 적용할 부분 업데이트 데이터.
 * @returns {(old: T | undefined) => T | undefined} -
 *   `queryClient.setQueryData`에 전달될 수 있는 업데이터 함수.
 *   이 함수는 이전 캐시 상태(`old`)를 받아 새로운 불변 상태를 반환합니다.
 */
export const createImmerApiDataUpdater = <T extends object>(updateData: Partial<T>) => {
  return (old: T | undefined): T | undefined => {
    if (!old) {
      return undefined
    }
    return produce(old, (draft) => {
      // draft.data는 T 타입이며, updateData는 Partial<T> 타입입니다.
      // Object.assign을 사용하여 updateData의 속성들을 draft.data에 병합합니다.
      Object.assign(draft, updateData)
    })
  }
}

/**
 * API 메서드를 래핑하여 에러 핸들링과 데이터 추출을 자동화하는 고차 함수입니다.
 * Axios 응답에서 data 속성을 자동으로 추출하고, 에러 발생 시 standardized error handling을 적용합니다.
 *
 * @template T - 래핑할 API 메서드의 타입 (AxiosPromise를 반환하는 함수)
 * @param {T} fn - 래핑할 원본 API 메서드
 * @returns {Function} 에러 핸들링과 데이터 추출이 적용된 래핑된 함수
 * @throws {Error} handleApiError에서 처리된 표준화된 에러
 */
export const withErrorHandling = <T extends (...args: any[]) => AxiosPromise<any>>(fn: T) => {
  return async (...args: Parameters<T>): Promise<Awaited<ReturnType<T>>["data"]> => {
    try {
      const response = await fn(...args)
      return response.data
    } catch (err) {
      throw handleApiError(err)
    }
  }
}

/**
 * 자동 생성된 API 클라이언트의 모든 메서드를 래핑하여
 * 에러 핸들링과 데이터 추출 로직이 적용된 서비스 객체를 생성합니다.
 *
 * @template T - API 클라이언트 인스턴스의 타입
 * @param {T} apiInstance - UserApiFactory 등으로 생성된 원본 API 클라이언트 인스턴스
 * @returns {Object} 모든 메서드가 withErrorHandling으로 래핑된 서비스 객체
 *
 * @example
 * ```typescript
 * const userApiClient = UserApiFactory(config)
 * const userService = createApiService(userApiClient)
 *
 * // 원본: userApiClient.getUser(id) -> AxiosResponse<ApiResponse<User>>
 * // 래핑: userService.getUser(id) -> Promise<ApiResponse<User>>
 * const userData = await userService.getUser(123)
 * ```
 */
export function createApiService<T extends object>(
  apiInstance: T,
): {
  [K in keyof T]: T[K] extends (...args: any[]) => any
    ? (...args: Parameters<T[K]>) => Promise<Awaited<ReturnType<T[K]>>["data"]>
    : T[K]
} {
  const service = {} as any

  // apiInstance의 모든 키(메서드명)를 순회합니다.
  for (const key in apiInstance) {
    // 프로토타입 체인이 아닌, 해당 객체가 직접 소유한 속성인지 확인합니다.
    if (Object.prototype.hasOwnProperty.call(apiInstance, key)) {
      const property = apiInstance[key]

      // 속성이 함수(API 메서드)인 경우에만 래핑을 적용합니다.
      if (typeof property === "function") {
        // .bind(apiInstance)를 통해 'this' 컨텍스트를 유지하고, withErrorHandling으로 래핑합니다.
        service[key] = withErrorHandling(property.bind(apiInstance))
      }
    }
  }

  return service
}

/**
 * 제네릭 낙관적 업데이트 헬퍼 함수를 생성합니다.
 * 다양한 도메인의 mutation에서 재사용 가능한 범용 헬퍼입니다.
 *
 * @template TData - API 응답 데이터 타입 (예: UserResponseWrapper, PostResponseWrapper)
 * @template TUpdateData - 업데이트할 데이터 타입 (예: UpdateUserRequestDto, UpdatePostRequestDto)
 * @param queryClient - React Query의 queryClient 인스턴스
 * @returns 낙관적 업데이트를 수행하는 함수
 *
 * @example
 * ```typescript
 * // User 도메인에서 사용
 * const optimisticUpdate = createOptimisticUpdate<UserResponseWrapper, UpdateUserRequestDto>(queryClient)
 * optimisticUpdate(queryKey, updateData, previousData)
 *
 * // Post 도메인에서 사용
 * const optimisticUpdate = createOptimisticUpdate<PostResponseWrapper, UpdatePostRequestDto>(queryClient)
 * optimisticUpdate(queryKey, updateData, previousData)
 * ```
 */
export const createOptimisticUpdate = <TData extends { data?: any }, TUpdateData extends object>(
  queryClient: QueryClient,
) => {
  return (queryKey: QueryKey, updateData: TUpdateData, previousData?: TData) => {
    if (previousData?.data) {
      queryClient.setQueryData<TData | undefined>(
        queryKey,
        createImmerApiDataUpdater<TData>({
          data: { ...previousData.data, ...updateData },
        } as Partial<TData>),
      )
    }
  }
}

// 시간 포맷팅 함수 (MM:SS)
export const formatTimeMMSS = (seconds: number) => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`
}
