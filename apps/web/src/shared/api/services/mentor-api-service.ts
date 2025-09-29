import { Configuration, MentorApiFactory } from "@repo/api-client/src"

import { AxiosInstance } from "axios"

import { apiClient } from "@/shared/api/core/axios"
import { createApiService } from "@/shared/utils"

const config: Configuration = new Configuration({})
const basePath: string = "/mentor"
const axiosInstance: AxiosInstance = apiClient.axiosInstance

const mentorApiFactory = MentorApiFactory(config, basePath, axiosInstance)

/**
 * Mentor API 서비스
 *
 * - 자동 생성된 `mentorApi`의 모든 메서드에 공통 에러 핸들링 및 데이터 추출 로직이 적용되어 있습니다.
 * - 사용 가능한 메서드는 `mentorApi`와 동일합니다. (e.g., `createMentorProfile`, `updateMentorProfile`)
 * - IDE의 자동 완성을 통해 사용 가능한 전체 메서드 목록을 확인할 수 있습니다.
 *
 * @example
 * await mentorApiService.createMentorProfile({ createMentorProfileDto: mentorData });
 * await mentorApiService.getMentorProfile({ userId: 'user123' });
 * await mentorApiService.updateMentorProfile({ idx: 1, updateMentorProfileDto: updateData });
 */
export const mentorApiService = createApiService(mentorApiFactory)