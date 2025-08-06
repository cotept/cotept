import { LoadingSpinner } from "./LoadingSpinner"

import type { Meta, StoryObj } from "@storybook/react"

const meta: Meta<typeof LoadingSpinner> = {
  title: "UI/LoadingSpinner",
  component: LoadingSpinner,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof LoadingSpinner>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const WithBackground: Story = {
  parameters: {
    backgrounds: {
      default: "dark",
      values: [
        { name: "dark", value: "#1a1a1a" },
        { name: "light", value: "#ffffff" },
      ],
    },
  },
}

export const InCard: Story = {
  decorators: [
    (Story) => (
      <div className="rounded-lg border p-8 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold">Loading Content...</h3>
        <Story />
      </div>
    ),
  ],
}
