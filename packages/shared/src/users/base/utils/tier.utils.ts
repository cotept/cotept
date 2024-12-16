// tier.utils.ts
import { TIER_INFO, TIER_LEVELS } from "../constants/tier.constants"
import { BojTier, ITierInfo, TierLevel, TierRank } from "../types/tier.types"

export const tierUtils = {
  /**
   * 티어 문자열을 파싱하여 레벨과 랭크를 반환
   */
  parseTier(tier: BojTier): { level: TierLevel; rank: TierRank } {
    const [level, rank] = tier.split("_") as [TierLevel, string]
    return {
      level,
      rank: Number(rank) as TierRank,
    }
  },

  /**
   * 두 티어를 비교하여 첫 번째 티어가 더 높은지 확인
   */
  isHigherTier(tier1: BojTier, tier2: BojTier): boolean {
    const t1 = this.parseTier(tier1)
    const t2 = this.parseTier(tier2)

    const t1Index = TIER_LEVELS.indexOf(t1.level)
    const t2Index = TIER_LEVELS.indexOf(t2.level)

    if (t1Index !== t2Index) {
      return t1Index > t2Index
    }
    return t1.rank > t2.rank
  },

  /**
   * 특정 티어의 요구사항 정보를 반환
   */
  getTierRequirements(tier: BojTier): ITierInfo | undefined {
    const { level, rank } = this.parseTier(tier)
    return TIER_INFO[level].find((t) => t.rank === rank)
  },

  /**
   * 문제 수와 레이팅으로 가능한 최고 티어를 계산
   */
  calculateTier(solvedCount: number, rating: number): BojTier {
    for (const level of [...TIER_LEVELS].reverse()) {
      const tierInfos = TIER_INFO[level]
      for (const info of tierInfos) {
        if (
          solvedCount >= info.requiredProblems &&
          rating >= info.requiredRating
        ) {
          return `${info.level}_${info.rank}` as BojTier
        }
      }
    }
    return "BRONZE_5" as BojTier
  },
}
