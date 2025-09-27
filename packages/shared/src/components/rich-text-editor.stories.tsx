import type { Meta, StoryObj } from "@storybook/react"
import { useState } from "react"

import { RichTextEditor } from "./rich-text-editor"

const meta: Meta<typeof RichTextEditor> = {
  title: "UI/RichTextEditor",
  component: RichTextEditor,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: "Tiptap 기반의 리치텍스트 에디터입니다. 멘토 프로필 소개글, 포스트 작성 등에 사용됩니다.",
      },
    },
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "error"],
      description: "에디터 테두리 스타일",
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
      description: "에디터 최소 높이",
    },
    contentVariant: {
      control: "select",
      options: ["default", "minimal"],
      description: "콘텐츠 영역 스타일",
    },
    showToolbar: {
      control: "boolean",
      description: "툴바 표시 여부",
    },
    stickyToolbar: {
      control: "boolean",
      description: "툴바 고정 여부",
    },
    disabled: {
      control: "boolean",
      description: "비활성화 상태",
    },
    placeholder: {
      control: "text",
      description: "플레이스홀더 텍스트",
    },
  },
}

export default meta
type Story = StoryObj<typeof RichTextEditor>

// 기본 스토리
export const Default: Story = {
  args: {
    placeholder: "내용을 입력하세요...",
    showToolbar: true,
    size: "md",
    variant: "default",
  },
}

// 제어 가능한 에디터 (실제 사용 예시)
export const Controlled: Story = {
  render: (args) => {
    const [content, setContent] = useState(`
      <h2>안녕하세요! 👋</h2>
      <p>저는 <strong>백엔드 개발</strong>을 전문으로 하는 멘토입니다.</p>
      <h3>전문 분야</h3>
      <ul>
        <li>Node.js & NestJS</li>
        <li>데이터베이스 설계</li>
        <li>API 개발</li>
      </ul>
      <blockquote>
        <p>"코드는 사람이 읽을 수 있어야 합니다"</p>
      </blockquote>
      <p>궁금한 점이 있으시면 언제든 <a href="mailto:mentor@cotept.com">연락</a>주세요!</p>
    `)

    return (
      <div className="space-y-4">
        <RichTextEditor {...args} content={content} onChange={setContent} />
        <div className="bg-muted mt-4 rounded-md p-4">
          <h4 className="mb-2 font-semibold">HTML 출력:</h4>
          <pre className="bg-background overflow-auto rounded border p-2 text-xs">{content}</pre>
        </div>
      </div>
    )
  },
  args: {
    placeholder: "멘토 소개글을 작성해보세요...",
    showToolbar: true,
    size: "lg",
  },
}

// 작은 크기
export const Small: Story = {
  args: {
    size: "sm",
    placeholder: "간단한 댓글을 입력하세요...",
    contentVariant: "minimal",
  },
}

// 큰 크기
export const Large: Story = {
  args: {
    size: "lg",
    placeholder: "포스트 내용을 작성하세요...",
    stickyToolbar: true,
  },
}

// 에러 상태
export const Error: Story = {
  args: {
    variant: "error",
    content: "<p>내용이 너무 짧습니다.</p>",
    placeholder: "최소 50자 이상 입력해주세요...",
  },
}

// 비활성화 상태
export const Disabled: Story = {
  args: {
    disabled: true,
    content: "<p>이 내용은 수정할 수 없습니다.</p>",
  },
}

// 툴바 없는 버전
export const NoToolbar: Story = {
  args: {
    showToolbar: false,
    content: "<p>툴바 없이 순수한 텍스트 입력만 가능합니다.</p>",
    placeholder: "텍스트만 입력하세요...",
  },
}

// 멘토 프로필 작성 시나리오
export const MentorProfile: Story = {
  render: () => {
    const [content, setContent] = useState("")

    return (
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <h2 className="mb-2 text-2xl font-bold">멘토 프로필 작성</h2>
          <p className="text-muted-foreground">자신의 전문 분야와 멘토링 스타일을 소개해주세요.</p>
        </div>

        <RichTextEditor
          content={content}
          onChange={setContent}
          placeholder="예: 안녕하세요! 저는 5년차 풀스택 개발자입니다. 주로 React와 Node.js를 사용하여..."
          size="lg"
          stickyToolbar={true}
        />

        <div className="text-muted-foreground flex justify-between text-sm">
          <span>{content.replace(/<[^>]*>/g, "").length}자 작성됨</span>
          <span>최소 100자 이상 권장</span>
        </div>
      </div>
    )
  },
}

// 포스트 작성 시나리오
export const PostWriting: Story = {
  render: () => {
    const [title, setTitle] = useState("")
    const [content, setContent] = useState("")

    return (
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <h2 className="mb-2 text-2xl font-bold">포스트 작성하기</h2>
          <p className="text-muted-foreground">개발 경험이나 팁을 공유해보세요.</p>
        </div>

        <div className="space-y-4">
          <input
            type="text"
            placeholder="포스트 제목을 입력하세요..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="placeholder:text-muted-foreground w-full border-none px-4 py-3 text-xl font-semibold outline-none"
          />

          <RichTextEditor
            content={content}
            onChange={setContent}
            placeholder="포스트 내용을 작성하세요..."
            size="lg"
            stickyToolbar={true}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="text-muted-foreground text-sm">{content.replace(/<[^>]*>/g, "").length}자</div>
          <div className="space-x-2">
            <button className="rounded-md border px-4 py-2 text-sm">임시저장</button>
            <button className="bg-primary text-primary-foreground rounded-md px-4 py-2 text-sm">발행하기</button>
          </div>
        </div>
      </div>
    )
  },
}
