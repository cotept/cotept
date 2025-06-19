import { createQueryKeys, createQueryKeyStore } from "@lukemorales/query-key-factory"
// 하나의 파일에서 쿼리 키를 관리.
export const queryKeys = createQueryKeyStore({
  // 사용자 관련 쿼리
  users: {
    all: null,
    lists: () => ["list"],
    list: (filters: Record<string, any>) => [filters],
    details: () => ["detail"],
    detail: (id: string) => [id],
    profile: (id: string) => ["profile", id],
  },

  // 멘토링 관련 쿼리
  mentoring: {
    all: null,
    sessions: () => ["sessions"],
    session: (id: string) => ["session", id],
    posts: () => ["posts"],
    post: (id: string) => ["post", id],
  },

  // 인증 관련 쿼리
  auth: {
    all: null,
    profile: () => ["profile"],
    verifications: () => ["verifications"],
  },

  // VOD 관련 쿼리
  vod: {
    all: null,
    collections: () => ["collections"],
    collection: (id: string) => ["collection", id],
    recordings: () => ["recordings"],
    recording: (id: string) => ["recording", id],
  },
})

// 타입 안전한 쿼리 키 접근
export type QueryKeys = typeof queryKeys
