import { createQueryKeys } from "@lukemorales/query-key-factory"

// 인증 관련 쿼리
export const auth = createQueryKeys("auth", {
  all: null,
  profile: () => ["profile"],
  verifications: () => ["verifications"],
})
