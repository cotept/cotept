// tier.constants.ts
import { BojTier, ITierInfo, TierLevel } from "../types/tier.types"

export const TIER_LEVELS = [
  "BRONZE",
  "SILVER",
  "GOLD",
  "PLATINUM",
  "DIAMOND",
  "RUBY",
] as const

export const MENTOR_TIER_REQUIREMENT = {
  MINIMUM_TIER: "PLATINUM_3" as BojTier,
  MINIMUM_SOLVED: 500, // 최소 500문제 해결
  MINIMUM_RATING: 1500, // 최소 레이팅
} as const

export const TIER_INFO: Record<TierLevel, ITierInfo[]> = {
  BRONZE: [
    { level: "BRONZE", rank: 5, requiredProblems: 1, requiredRating: 30 },
    { level: "BRONZE", rank: 4, requiredProblems: 5, requiredRating: 60 },
    { level: "BRONZE", rank: 3, requiredProblems: 10, requiredRating: 90 },
    { level: "BRONZE", rank: 2, requiredProblems: 15, requiredRating: 120 },
    { level: "BRONZE", rank: 1, requiredProblems: 20, requiredRating: 150 },
  ],
  SILVER: [
    { level: "SILVER", rank: 5, requiredProblems: 30, requiredRating: 300 },
    { level: "SILVER", rank: 4, requiredProblems: 40, requiredRating: 400 },
    { level: "SILVER", rank: 3, requiredProblems: 50, requiredRating: 500 },
    { level: "SILVER", rank: 2, requiredProblems: 60, requiredRating: 600 },
    { level: "SILVER", rank: 1, requiredProblems: 70, requiredRating: 700 },
  ],
  GOLD: [
    { level: "GOLD", rank: 5, requiredProblems: 100, requiredRating: 800 },
    { level: "GOLD", rank: 4, requiredProblems: 150, requiredRating: 900 },
    { level: "GOLD", rank: 3, requiredProblems: 200, requiredRating: 1000 },
    { level: "GOLD", rank: 2, requiredProblems: 250, requiredRating: 1100 },
    { level: "GOLD", rank: 1, requiredProblems: 300, requiredRating: 1200 },
  ],
  PLATINUM: [
    { level: "PLATINUM", rank: 5, requiredProblems: 350, requiredRating: 1300 },
    { level: "PLATINUM", rank: 4, requiredProblems: 400, requiredRating: 1400 },
    { level: "PLATINUM", rank: 3, requiredProblems: 450, requiredRating: 1500 },
    { level: "PLATINUM", rank: 2, requiredProblems: 500, requiredRating: 1600 },
    { level: "PLATINUM", rank: 1, requiredProblems: 550, requiredRating: 1700 },
  ],
  DIAMOND: [
    { level: "DIAMOND", rank: 5, requiredProblems: 600, requiredRating: 1800 },
    { level: "DIAMOND", rank: 4, requiredProblems: 650, requiredRating: 1900 },
    { level: "DIAMOND", rank: 3, requiredProblems: 700, requiredRating: 2000 },
    { level: "DIAMOND", rank: 2, requiredProblems: 750, requiredRating: 2100 },
    { level: "DIAMOND", rank: 1, requiredProblems: 800, requiredRating: 2200 },
  ],
  RUBY: [
    { level: "RUBY", rank: 5, requiredProblems: 850, requiredRating: 2300 },
    { level: "RUBY", rank: 4, requiredProblems: 900, requiredRating: 2400 },
    { level: "RUBY", rank: 3, requiredProblems: 950, requiredRating: 2500 },
    { level: "RUBY", rank: 2, requiredProblems: 1000, requiredRating: 2600 },
    { level: "RUBY", rank: 1, requiredProblems: 1100, requiredRating: 2700 },
  ],
}
