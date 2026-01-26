import type { Meta, StoryObj } from "@storybook/react"

import { TierBadge, TierBadgeList } from "./tier-badge"

const meta: Meta<typeof TierBadge> = {
  title: "Components/TierBadge",
  component: TierBadge,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    tier: {
      control: "select",
      options: ["unrated", "bronze", "silver", "gold", "platinum", "diamond", "ruby"],
      description: "solved.ac 티어 종류",
    },
    rank: {
      control: { type: "number", min: 1, max: 5 },
      description: "티어 랭크 (5~1, 숫자가 작을수록 높은 등급)",
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg", "xl"],
      description: "배지 크기",
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

/**
 * 기본 티어 배지
 */
export const Default: Story = {
  args: {
    tier: "platinum",
    rank: 3,
    size: "md",
  },
}

/**
 * 레이블과 함께 표시
 */
export const WithLabel: Story = {
  args: {
    tier: "diamond",
    rank: 2,
    size: "md",
  },
}

/**
 * Unrated 배지 (물음표)
 */
export const Unrated: Story = {
  args: {
    tier: "unrated",
    size: "md",
  },
}

/**
 * 모든 티어 표시
 */
export const AllTiers: Story = {
  render: () => (
    <div className="space-y-6">
      <div>
        <h3 className="mb-3 text-lg font-bold">Small Size</h3>
        <TierBadgeList size="sm" />
      </div>
      <div>
        <h3 className="mb-3 text-lg font-bold">Medium Size (Default)</h3>
        <TierBadgeList size="md" />
      </div>
      <div>
        <h3 className="mb-3 text-lg font-bold">Large Size</h3>
        <TierBadgeList size="lg" />
      </div>
      <div>
        <h3 className="mb-3 text-lg font-bold">Extra Large Size</h3>
        <TierBadgeList size="xl" />
      </div>
    </div>
  ),
}

/**
 * 다양한 랭크 표시
 */
export const DifferentRanks: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <TierBadge tier="platinum" rank={5} />
      <TierBadge tier="platinum" rank={4} />
      <TierBadge tier="platinum" rank={3} />
      <TierBadge tier="platinum" rank={2} />
      <TierBadge tier="platinum" rank={1} />
    </div>
  ),
}

/**
 * 필터 UI 예시
 */
export const FilterExample: Story = {
  render: () => (
    <div className="flex flex-col gap-3 rounded-xl border p-4">
      <h3 className="font-bold">티어 필터</h3>
      <div className="flex flex-wrap gap-2">
        <button className="border-border hover:border-primary flex items-center gap-2 rounded-lg border px-3 py-2 transition-colors">
          <TierBadge tier="bronze" rank={5} size="sm" />
          <span className="text-sm font-medium">브론즈+</span>
        </button>
        <button className="border-border hover:border-primary flex items-center gap-2 rounded-lg border px-3 py-2 transition-colors">
          <TierBadge tier="silver" rank={5} size="sm" />
          <span className="text-sm font-medium">실버+</span>
        </button>
        <button className="border-primary bg-primary/10 border-primary flex items-center gap-2 rounded-lg border-2 px-3 py-2 transition-colors">
          <TierBadge tier="gold" rank={5} size="sm" />
          <span className="text-primary text-sm font-bold">골드+</span>
        </button>
        <button className="border-border hover:border-primary flex items-center gap-2 rounded-lg border px-3 py-2 transition-colors">
          <TierBadge tier="platinum" rank={5} size="sm" />
          <span className="text-sm font-medium">플래티넘+</span>
        </button>
        <button className="border-border hover:border-primary flex items-center gap-2 rounded-lg border px-3 py-2 transition-colors">
          <TierBadge tier="diamond" rank={5} size="sm" />
          <span className="text-sm font-medium">다이아몬드+</span>
        </button>
        <button className="border-border hover:border-primary flex items-center gap-2 rounded-lg border px-3 py-2 transition-colors">
          <TierBadge tier="ruby" rank={1} size="sm" />
          <span className="text-sm font-medium">루비+</span>
        </button>
      </div>
    </div>
  ),
}
