import { produce } from "immer"

import { ApiResponse } from "@/shared/api/core/types"

/**
 * Immer를 사용하여 ApiResponse<T> 형태의 캐시 데이터를 부분적으로 업데이트하기 위한
 * `queryClient.setQueryData`용 업데이터 함수를 생성합니다.
 * 이 함수는 ApiResponse의 `data` 속성 내의 데이터를 업데이트하는 데 특화되어 있습니다.
 *
 * @template T - ApiResponse의 `data` 속성 타입 (예: `User`, `Post`)
 * @template U - 업데이트할 부분 데이터의 타입 (예: `Partial<User>`, `UpdateUserRequest`)
 *
 * @param {U} updateData - 캐시의 `data` 속성에 적용할 부분 업데이트 데이터.
 * @returns {(old: ApiResponse<T> | undefined) => ApiResponse<T> | undefined} -
 *   `queryClient.setQueryData`에 전달될 수 있는 업데이터 함수.
 *   이 함수는 이전 캐시 상태(`old`)를 받아 새로운 불변 상태를 반환합니다.
 */
export const createImmerApiDataUpdater = <T extends object, U extends Partial<T>>(updateData: U) => {
  return (old: ApiResponse<T> | undefined): ApiResponse<T> | undefined => {
    if (!old) {
      return undefined
    }
    return produce(old, (draft) => {
      // draft.data는 T 타입이며, updateData는 Partial<T> 타입입니다.
      // Object.assign을 사용하여 updateData의 속성들을 draft.data에 병합합니다.
      Object.assign(draft.data, updateData)
    })
  }
}
