import { useQuery, type UseQueryOptions } from "@tanstack/react-query"

import { mentorKeys } from "./queryKey"

import type { MentorProfileDto } from "@repo/api-client"

import { ApiError } from "@/shared/api/core/types"
import { mentorApiService } from "@/shared/api/services/mentor-api-service"

// 멘토 프로필 조회
export function useGetMentorProfile(userId: string, options?: UseQueryOptions<MentorProfileDto, ApiError>) {
  return useQuery({
    queryKey: mentorKeys.profile(userId).queryKey,
    queryFn: () => mentorApiService.getMentorProfile({ userId }),
    staleTime: 5 * 60 * 1000, // 5분
    gcTime: 10 * 60 * 1000, // 10분
    enabled: !!userId,
    ...options,
  })
}

// 내 멘토 프로필 조회 (현재 로그인된 사용자)
export function useGetMyMentorProfile(userId: string, options?: UseQueryOptions<MentorProfileDto, ApiError>) {
  return useQuery({
    queryKey: mentorKeys.myProfile().queryKey,
    queryFn: () => mentorApiService.getMentorProfile({ userId }),
    staleTime: 2 * 60 * 1000, // 2분 (자신의 프로필은 더 자주 업데이트)
    gcTime: 5 * 60 * 1000, // 5분
    enabled: !!userId,
    ...options,
  })
}
