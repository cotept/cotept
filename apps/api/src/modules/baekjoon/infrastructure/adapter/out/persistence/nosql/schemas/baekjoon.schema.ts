import { UserActivityDocument } from "@/shared/infrastructure/persistence/nosql/schemas/base.schema"

/**
 * solved.ac API 태그 응답 타입들 (API 스펙 그대로)
 */
export type TagDisplayName = {
  language: string
  name: string
  short: string
}

export type TagAlias = {
  alias: string
}

export type TagInfo = {
  key: string
  isMeta: boolean
  bojTagId: number
  problemCount: number
  displayNames: TagDisplayName[]
  aliases: TagAlias[]
}

export type BojTag = {
  tag: TagInfo
  solvedCount: number
  rating: number
  ratingByProblemsSum: number
  ratingByClass: number
  ratingBySolvedCount: number
  ratingProblemsCutoff: number
}

/**
 * 백준 태그 캐시 문서 - API 응답 그대로 저장
 */
export interface BaekjoonTagCacheDocument extends UserActivityDocument {
  type: "tag_cache"
  data: {
    handle: string
    apiResponse: BojTag[] // solved.ac API 응답 그대로!
    cachedAt: string
    responseTime?: number // API 응답 시간 (성능 모니터링용)
  }
}
