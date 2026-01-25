import { FullPageLoading, InlineLoading, LoadingSpinner } from "./LoadingSpinner"

import type { Meta, StoryObj } from "@storybook/react"

const meta: Meta<typeof LoadingSpinner> = {
  title: "UI/LoadingSpinner",
  component: LoadingSpinner,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
      description: "스피너 크기",
    },
    message: {
      control: "text",
      description: "로딩 메시지",
    },
  },
} satisfies Meta<typeof LoadingSpinner>

export default meta
type Story = StoryObj<typeof meta>

// 기본 스피너
export const Default: Story = {
  args: {
    size: "md",
  },
}

// 메시지가 있는 스피너
export const WithMessage: Story = {
  args: {
    size: "md",
    message: "데이터를 불러오는 중입니다...",
  },
}

// 작은 스피너
export const Small: Story = {
  args: {
    size: "sm",
    message: "처리 중...",
  },
}

// 큰 스피너
export const Large: Story = {
  args: {
    size: "lg",
    message: "잠시만 기다려주세요",
  },
}

// 다크 배경
export const WithDarkBackground: Story = {
  args: {
    size: "md",
    message: "로딩 중...",
  },
  parameters: {
    backgrounds: {
      default: "dark",
      values: [{ name: "dark", value: "#1a1a1a" }],
    },
  },
}

// 카드 내부
export const InCard: Story = {
  args: {
    size: "md",
    message: "콘텐츠를 불러오는 중...",
  },
  decorators: [
    (Story) => (
      <div className="rounded-lg border p-8 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold">Loading Content...</h3>
        <Story />
      </div>
    ),
  ],
}

// 인라인 로딩 (버튼 내부용)
export const Inline: StoryObj = {
  render: () => (
    <div className="flex gap-4">
      <button className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 flex items-center gap-2">
        <InlineLoading />
        로딩 중...
      </button>
      <button className="rounded-md border border-gray-300 px-4 py-2 hover:bg-gray-50 flex items-center gap-2">
        <InlineLoading className="text-gray-600" />
        처리 중
      </button>
    </div>
  ),
}

// 전체 페이지 로딩
export const FullPage: StoryObj = {
  render: () => <FullPageLoading message="페이지를 불러오는 중입니다..." />,
  parameters: {
    layout: "fullscreen",
  },
}
