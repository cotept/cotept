// tier.types.ts
import { TIER_LEVELS } from "../constants/tier.constants"

export type TierLevel = (typeof TIER_LEVELS)[number]
export type TierRank = 1 | 2 | 3 | 4 | 5
export type BojTier = `${TierLevel}_${TierRank}`

export interface ITierInfo {
  level: TierLevel
  rank: TierRank
  requiredProblems: number
  requiredRating: number
}
