//mentor-requirements.constants.ts

import { BojTier } from "../../base/types/tier.types"

export const MENTOR_REQUIREMENTS = {
  MINIMUM_TIER: "PLATINUM_3" as BojTier,
  MINIMUM_SOLVED: 500,
  MINIMUM_RATING: 1500,
} as const
