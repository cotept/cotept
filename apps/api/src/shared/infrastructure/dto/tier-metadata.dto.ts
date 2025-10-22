import { ApiProperty } from "@nestjs/swagger"

import { TierColorEnum, TierLevelEnum, TierNameEnum } from "@/modules/baekjoon/domain/vo"

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
    enum: TierLevelEnum,
    example: TierLevelEnum.PlatinumIII,
    enumName: "TierLevel",
    "x-enumNames": Object.keys(TierLevelEnum),
  })
  level: typeof TierLevelEnum

  @ApiProperty({
    description: "Tier display name",
    example: TierNameEnum.PlatinumIII,
    enum: TierNameEnum,
    enumName: "TierName",
    "x-enumNames": Object.keys(TierNameEnum),
  })
  name: typeof TierNameEnum

  @ApiProperty({
    description: "Tier color hex code",
    example: TierColorEnum.PlatinumIII,
    enum: TierColorEnum,
    enumName: "TierColor",
    "x-enumNames": Object.keys(TierColorEnum),
  })
  color: typeof TierColorEnum
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
    enum: TierLevelEnum,
    example: TierLevelEnum.PlatinumIII,
  })
  mentorEligibilityTier: TierLevelEnum
}
