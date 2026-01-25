import { Button } from "@repo/shared/components/button"
import type { Meta, StoryObj } from "@storybook/react"
import { fn } from "@storybook/test"

const meta: Meta<typeof Button> = {
  title: "Shared/Button",
  component: Button,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "destructive", "outline", "secondary", "ghost", "link"],
    },
    size: {
      control: "select",
      options: ["default", "sm", "lg", "icon"],
    },
    asChild: {
      control: "boolean",
    },
  },
  args: {
    onClick: fn(),
  },
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

// 기본 버튼 variants
export const Default: Story = {
  args: {
    children: "Button",
  },
}

export const Destructive: Story = {
  args: {
    variant: "destructive",
    children: "Delete",
  },
}

export const Outline: Story = {
  args: {
    variant: "outline",
    children: "Outline",
  },
}

export const Secondary: Story = {
  args: {
    variant: "secondary",
    children: "Secondary",
  },
}

export const Ghost: Story = {
  args: {
    variant: "ghost",
    children: "Ghost",
  },
}

export const Link: Story = {
  args: {
    variant: "link",
    children: "Link",
  },
}

// 크기 variants
export const Small: Story = {
  args: {
    size: "sm",
    children: "Small",
  },
}

export const Large: Story = {
  args: {
    size: "lg",
    children: "Large",
  },
}

export const Icon: Story = {
  args: {
    size: "icon",
    children: "🚀",
  },
}

// 상태별 스토리
export const Disabled: Story = {
  args: {
    disabled: true,
    children: "Disabled",
  },
}

export const Loading: Story = {
  args: {
    disabled: true,
    children: (
      <>
        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        Loading...
      </>
    ),
  },
}

// 실제 사용 사례
export const WithIcon: Story = {
  args: {
    children: (
      <>
        <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Add Item
      </>
    ),
  },
}

export const Submit: Story = {
  args: {
    type: "submit",
    children: "Submit Form",
  },
}

export const FullWidth: Story = {
  args: {
    className: "w-full",
    children: "Full Width Button",
  },
  parameters: {
    layout: "padded",
  },
}
