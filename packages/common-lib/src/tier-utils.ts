/**
 * solved.ac 티어 관련 유틸리티 함수 (순수 로직)
 */

export type TierType = "unrated" | "bronze" | "silver" | "gold" | "platinum" | "diamond" | "ruby"

export interface TierInfo {
  tier: TierType
  rank: number
}

/**
 * tierIndex를 티어와 랭크로 변환
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
 */
export function getTierFullLabel(tier: TierType, rank: number): string {
  if (tier === "unrated") return "Unrated"
  return `${getTierLabel(tier)} ${rank}`
}
