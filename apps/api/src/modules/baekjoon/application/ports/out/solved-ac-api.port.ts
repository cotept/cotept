/**
 * solved.ac API 포트
 * 외부 solved.ac API와의 통신을 담당하는 아웃바운드 포트
 */
export abstract class SolvedAcApiPort {
  /**
   * 사용자 존재 여부를 확인합니다
   */
  abstract checkUserExists(handle: string): Promise<boolean>

  /**
   * 사용자 프로필 정보를 조회합니다
   */
  abstract getUserProfile(handle: string): Promise<UserProfile>

  /**
   * 사용자 부가 정보를 조회합니다 (인증용)
   */
  abstract getUserAdditionalInfo(handle: string): Promise<AdditionalUserInfo>

  /**
   * 사용자 태그 통계를 조회합니다
   */
  abstract getUserTagRatings(handle: string): Promise<BojTag[]>
}

// solved.ac API 응답 타입들

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

export type UserProfile = {
  handle: string
  bio: string
  verified: boolean
  badgeId: string
  backgroundId: string
  profileImageUrl: string | null
  solvedCount: number
  voteCount: number
  class: number
  classDecoration: string
  rivalCount: number
  reverseRivalCount: number
  tier: number
  rating: number
  ratingByProblemsSum: number
  ratingByClass: number
  ratingBySolvedCount: number
  ratingByVoteCount: number
  arenaTier: number
  arenaRating: number
  arenaMaxTier: number
  arenaMaxRating: number
  arenaCompetedRoundCount: number
  maxStreak: number
  coins: number
  stardusts: number
  joinedAt: string // ISO8601 date string
  bannedUntil: string // ISO8601 date string
  proUntil: string // ISO8601 date string
  rank: number
  isRival: boolean
  isReverseRival: boolean
  blocked: boolean
  reverseBlocked: boolean
}

export type AdditionalUserInfo = {
  bio: string
  countryCode: string | null
  gender: 0 | 1
  pronouns: string | null
  birthYear: number | null
  birthMonth: number | null
  birthDay: number | null
  name: string | null
  nameNative: string | null
}
