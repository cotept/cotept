import { AuthApiFactory, Configuration } from "@repo/api-client/src"

import { AxiosInstance } from "axios"

import { apiClient } from "@/shared/api/core/axios"
import { createApiService } from "@/shared/utils"

const config: Configuration = new Configuration({})
const basePath: string = "/auth"
const axiosInstance: AxiosInstance = apiClient.axiosInstance

const authApiFactory = AuthApiFactory(config, basePath, axiosInstance)
// console.log({ config, basePath, axiosInstance, authApiFactory })
/**
 * Auth API 서비스
 *
 * - 자동 생성된 `authApi`의 모든 메서드에 공통 에러 핸들링 및 데이터 추출 로직이 적용되어 있습니다.
 * - 사용 가능한 메서드는 `authApi`와 동일합니다. (e.g., `login`, `logout`)
 * - IDE의 자동 완성을 통해 사용 가능한 전체 메서드 목록을 확인할 수 있습니다.
 *
 * @example
 * await authApiService.login({ email: 'test@example.com', password: 'password' });
 * await authApiService.logout();
 */
// export const authApiService = createApiService(userApi)

export const authApiService = createApiService(authApiFactory)
