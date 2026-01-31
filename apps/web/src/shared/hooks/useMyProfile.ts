import { type MyProfileResponseWrapper } from "@repo/api-client"

import { useQuery, UseQueryOptions } from "@tanstack/react-query"

import { userProfileApiService } from "@/shared/api/services/user-profile-api-service"

const QUERY_KEY = ["shared", "myProfile"] as const

export function useMyProfile(
  options?: Omit<UseQueryOptions<MyProfileResponseWrapper, Error, MyProfileResponseWrapper, typeof QUERY_KEY>, "queryKey" | "queryFn">,
) {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => userProfileApiService.getMyProfile(),
    staleTime: 5 * 60 * 1000, // 5분
    gcTime: 10 * 60 * 1000, // 10분
    ...options,
  })
}
