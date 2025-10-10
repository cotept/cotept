import { ApiProperty } from "@nestjs/swagger"

import { Tier, TierLevel } from "@/modules/baekjoon/domain/vo"

const TIER_NAMES = Tier.getAllTiers().map((tier) => tier.name)

/**
 * Tier Level Enum Schema (for Swagger export)
 *
 * @description
 * This DTO wraps the domain TierLevel enum to expose it in OpenAPI spec.
 * Values are dynamically extracted from domain model via Tier.getAllTiers().
 */
export class TierLevelSchema {
  @ApiProperty({
    description: "Tier level value",
    enum: TierLevel,
    enumName: "TierLevel",
    example: TierLevel.PLATINUM_III,
  })
  level: TierLevel

  @ApiProperty({
    description: "Tier display name",
    example: "Platinum III",
    enum: TIER_NAMES,
  })
  name: string

  @ApiProperty({
    description: "Tier color hex code",
    example: "#27E2A4",
  })
  color: string
}

/**
 * All available tiers metadata
 */
export class TierMetadataDto {
  @ApiProperty({
    description: "List of all available tiers",
    type: [TierLevelSchema],
  })
  tiers: TierLevelSchema[]

  @ApiProperty({
    description: "Mentor eligibility threshold tier level",
    enum: TierLevel,
    example: TierLevel.PLATINUM_III,
  })
  mentorEligibilityTier: TierLevel
}
