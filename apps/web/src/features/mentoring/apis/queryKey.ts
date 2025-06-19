import { createQueryKeys, mergeQueryKeys } from "@lukemorales/query-key-factory"
// 여러 파일에서 쿼리 키를 관리하고 하나로 머지.

// 사용자 관련 쿼리
export const users = createQueryKeys("users", {
  all: null,
  lists: () => ["list"],
  list: (filters: Record<string, any>) => [filters],
  details: () => ["detail"],
  detail: (id: string) => [id],
  profile: (id: string) => ["profile", id],
})

// 멘토링 관련 쿼리
export const mentoring = createQueryKeys("mentoring", {
  all: null,
  sessions: () => ["sessions"],
  session: (id: string) => ["session", id],
  posts: () => ["posts"],
  post: (id: string) => ["post", id],
})

// 인증 관련 쿼리
export const auth = createQueryKeys("auth", {
  all: null,
  profile: () => ["profile"],
  verifications: () => ["verifications"],
})

// VOD 관련 쿼리
export const vod = createQueryKeys("vod", {
  all: null,
  collections: () => ["collections"],
  collection: (id: string) => ["collection", id],
  recordings: () => ["recordings"],
  recording: (id: string) => ["recording", id],
})

// 타입 안전한 쿼리 키 접근

export const queries = mergeQueryKeys(users, mentoring, auth, vod)

export type QueryKeys = typeof queries
