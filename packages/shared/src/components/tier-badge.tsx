import { cn } from "@repo/shared/lib/utils"
import { cva, type VariantProps } from "class-variance-authority"
import * as React from "react"

/**
 * solved.ac 티어 배지 컴포넌트
 *
 * @example
 * ```tsx
 * <TierBadge tier="bronze" rank={5} />
 * <TierBadge tier="platinum" rank={3} size="lg" />
 * <TierBadge tier="ruby" rank={1} showLabel />
 * ```
 */

const tierBadgeVariants = cva(
  "inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 rounded-sm px-2 py-1 font-medium transition-colors",
  {
    variants: {
      tier: {
        unrated: "bg-tier-unrated text-white",
        bronze: "bg-tier-bronze text-white",
        silver: "bg-tier-silver text-white",
        gold: "bg-tier-gold text-white",
        platinum: "bg-tier-platinum text-white",
        diamond: "bg-tier-diamond text-white",
        ruby: "bg-tier-ruby text-white",
      },
      size: {
        sm: "text-xs gap-1",
        md: "text-xs gap-1.5",
        lg: "text-sm gap-2",
        xl: "text-base gap-2",
      },
    },
    defaultVariants: {
      tier: "unrated",
      size: "md",
    },
  },
)

// 티어별 레이블
const TIER_LABELS: Record<string, string> = {
  unrated: "Unrated",
  bronze: "브론즈",
  silver: "실버",
  gold: "골드",
  platinum: "플래티넘",
  diamond: "다이아",
  ruby: "루비",
}

// 티어별 색상 (SVG용)
const TIER_COLORS: Record<string, string> = {
  unrated: "#2d2d2d",
  bronze: "#ad5600",
  silver: "#435f7a",
  gold: "#ec9a00",
  platinum: "#27e2a4",
  diamond: "#00b4fc",
  ruby: "#ff0062",
}

type TierBadgeProps = {
  /**
   * 티어 종류
   */
  tier: "unrated" | "bronze" | "silver" | "gold" | "platinum" | "diamond" | "ruby"
  /**
   * 티어 랭크 (5~1, 숫자가 작을수록 높은 등급)
   */
  rank?: number
  /**
   * 추가 클래스명
   */
  className?: string
} & VariantProps<typeof tierBadgeVariants>

function TierBadge({ tier, rank, size = "md", className }: TierBadgeProps) {
  // Unrated는 물음표 표시
  const displayText = tier === "unrated" ? "?" : rank?.toString() || "5"
  const label = TIER_LABELS[tier]
  const color = TIER_COLORS[tier]

  // SVG 크기 설정
  const svgSize = {
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
  }[size!]

  return (
    <div className={cn(tierBadgeVariants({ tier, size }), className)} data-slot="tier-badge">
      {/* 레이블 (항상 표시) */}
      <span suppressHydrationWarning>{label}</span>
      {/* 방패 모양 아이콘 */}
      <svg
        width={svgSize}
        height={svgSize}
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        suppressHydrationWarning>
        {/* 하단이 뾰족한 방패 모양 */}
        <path
          d="M10 2L3 5V9C3 13.5 6 17 10 18C14 17 17 13.5 17 9V5L10 2Z"
          fill="white"
          fillOpacity="0.9"
          suppressHydrationWarning
        />
        <text
          x="10"
          y="14"
          textAnchor="middle"
          fontSize="12"
          fontWeight="bold"
          fill={color}
          style={{ fontFamily: "Pretendard Variable, sans-serif" }}
          suppressHydrationWarning>
          {displayText}
        </text>
      </svg>
    </div>
  )
}

/**
 * 티어 배지 리스트 (모든 티어 표시용)
 *
 * @example
 * ```tsx
 * <TierBadgeList />
 * <TierBadgeList size="sm" />
 * ```
 */
function TierBadgeList({ size = "md" }: { size?: "sm" | "md" | "lg" | "xl" }) {
  const tiers: Array<{ tier: TierBadgeProps["tier"]; rank?: number }> = [
    { tier: "unrated" },
    { tier: "bronze", rank: 5 },
    { tier: "silver", rank: 5 },
    { tier: "gold", rank: 5 },
    { tier: "platinum", rank: 5 },
    { tier: "diamond", rank: 5 },
    { tier: "ruby", rank: 1 },
  ]

  return (
    <div className="flex flex-wrap items-center gap-2">
      {tiers.map(({ tier, rank }) => (
        <TierBadge key={tier} tier={tier} rank={rank} size={size} />
      ))}
    </div>
  )
}

export { TierBadge, TierBadgeList, tierBadgeVariants }
export type { TierBadgeProps }
