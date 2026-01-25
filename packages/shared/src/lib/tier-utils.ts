/**
 * solved.ac 티어 관련 유틸리티 함수
 */

export type TierType = "unrated" | "bronze" | "silver" | "gold" | "platinum" | "diamond" | "ruby"

export interface TierInfo {
  tier: TierType
  rank: number
}

/**
 * tierIndex를 티어와 랭크로 변환
 *
 * @param tierIndex - 0~6 사이의 티어 인덱스 (0: unrated, 1: bronze, ..., 6: ruby)
 * @returns 티어 종류와 랭크 객체
 *
 * @example
 * ```ts
 * getTierFromIndex(0) // { tier: "unrated", rank: 5 }
 * getTierFromIndex(3) // { tier: "gold", rank: 5 }
 * getTierFromIndex(6) // { tier: "ruby", rank: 1 }
 * ```
 */
export function getTierFromIndex(tierIndex: number): TierInfo {
  const tiers: TierInfo[] = [
    { tier: "unrated", rank: 5 },
    { tier: "bronze", rank: 5 },
    { tier: "silver", rank: 5 },
    { tier: "gold", rank: 5 },
    { tier: "platinum", rank: 5 },
    { tier: "diamond", rank: 5 },
    { tier: "ruby", rank: 1 },
  ]

  const index = Math.max(0, Math.min(tierIndex, tiers.length - 1))
  return tiers[index]
}

/**
 * 티어와 랭크를 tierIndex로 변환
 *
 * @param tier - 티어 종류
 * @param rank - 티어 랭크 (1~5)
 * @returns tierIndex (0~6)
 *
 * @example
 * ```ts
 * getTierIndex("bronze", 5) // 1
 * getTierIndex("platinum", 3) // 4
 * getTierIndex("ruby", 1) // 6
 * ```
 */
export function getTierIndex(tier: TierType, rank: number = 5): number {
  const tierMap: Record<TierType, number> = {
    unrated: 0,
    bronze: 1,
    silver: 2,
    gold: 3,
    platinum: 4,
    diamond: 5,
    ruby: 6,
  }

  return tierMap[tier] ?? 0
}

/**
 * 티어 한글 레이블 가져오기
 *
 * @param tier - 티어 종류
 * @returns 한글 레이블
 *
 * @example
 * ```ts
 * getTierLabel("bronze") // "브론즈"
 * getTierLabel("platinum") // "플래티넘"
 * ```
 */
export function getTierLabel(tier: TierType): string {
  const labels: Record<TierType, string> = {
    unrated: "Unrated",
    bronze: "브론즈",
    silver: "실버",
    gold: "골드",
    platinum: "플래티넘",
    diamond: "다이아몬드",
    ruby: "루비",
  }

  return labels[tier]
}

/**
 * 티어 전체 레이블 (티어 + 랭크)
 *
 * @param tier - 티어 종류
 * @param rank - 티어 랭크 (1~5)
 * @returns 전체 레이블 (예: "브론즈 5", "플래티넘 3")
 *
 * @example
 * ```ts
 * getTierFullLabel("bronze", 5) // "브론즈 5"
 * getTierFullLabel("platinum", 3) // "플래티넘 3"
 * getTierFullLabel("ruby", 1) // "루비 1"
 * ```
 */
export function getTierFullLabel(tier: TierType, rank: number): string {
  if (tier === "unrated") return "Unrated"
  return `${getTierLabel(tier)} ${rank}`
}
