"use client"

import { cn } from "@repo/shared/lib/utils"
import Link from "@tiptap/extension-link"
import Placeholder from "@tiptap/extension-placeholder"
import { EditorContent, useEditor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import { cva, type VariantProps } from "class-variance-authority"
import { Bold, Code, Italic, Link as LinkIcon, List, ListOrdered, Quote, Redo, Undo } from "lucide-react"
import { forwardRef, useCallback } from "react"

import { Button } from "./button"
import { Separator } from "./separator"

const editorStyles = cva("relative w-full rounded-md border transition-[color,box-shadow] outline-none", {
  variants: {
    variant: {
      default: "border-input bg-transparent focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-[3px]",
      error: "border-destructive focus-within:border-destructive focus-within:ring-destructive/20",
    },
    size: {
      sm: "min-h-[100px]",
      md: "min-h-[150px]",
      lg: "min-h-[200px]",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "md",
  },
})

const toolbarStyles = cva("flex items-center gap-1 p-2 border-b border-border bg-muted/50", {
  variants: {
    sticky: {
      true: "sticky top-0 z-10",
      false: "",
    },
  },
  defaultVariants: {
    sticky: false,
  },
})

const contentStyles = cva("prose prose-sm max-w-none p-3 focus:outline-none [&_.ProseMirror]:outline-none", {
  variants: {
    variant: {
      default: "prose-neutral dark:prose-invert",
      minimal: "prose-neutral dark:prose-invert prose-p:my-2 prose-headings:my-3",
    },
  },
  defaultVariants: {
    variant: "default",
  },
})

export interface RichTextEditorProps extends VariantProps<typeof editorStyles> {
  content?: string
  onChange?: (content: string) => void
  placeholder?: string
  className?: string
  disabled?: boolean
  showToolbar?: boolean
  stickyToolbar?: boolean
  contentVariant?: VariantProps<typeof contentStyles>["variant"]
}

const ToolbarButton = forwardRef<
  HTMLButtonElement,
  {
    isActive?: boolean
    children: React.ReactNode
    onClick?: () => void
    disabled?: boolean
    title?: string
  }
>(({ isActive, children, onClick, disabled, title, ...props }, ref) => (
  <Button
    ref={ref}
    variant={isActive ? "default" : "ghost"}
    size="sm"
    onClick={onClick}
    disabled={disabled}
    title={title}
    className={cn("h-8 w-8 p-0", isActive && "bg-accent text-accent-foreground")}
    {...props}>
    {children}
  </Button>
))
ToolbarButton.displayName = "ToolbarButton"

export const RichTextEditor = forwardRef<HTMLDivElement, RichTextEditorProps>(
  (
    {
      content = "",
      onChange,
      placeholder = "내용을 입력하세요...",
      className,
      variant,
      size,
      disabled = false,
      showToolbar = true,
      stickyToolbar = false,
      contentVariant = "default",
      ...props
    },
    ref,
  ) => {
    const editor = useEditor({
      extensions: [
        StarterKit.configure({
          heading: {
            levels: [1, 2, 3],
          },
          bulletList: {
            keepMarks: true,
            keepAttributes: false,
          },
          orderedList: {
            keepMarks: true,
            keepAttributes: false,
          },
        }),
        Placeholder.configure({
          placeholder,
          emptyEditorClass: "is-editor-empty",
        }),
        Link.configure({
          openOnClick: false,
          HTMLAttributes: {
            class: "text-primary underline underline-offset-4 hover:text-primary/80",
          },
        }),
      ],
      content,
      onUpdate: ({ editor }) => {
        onChange?.(editor.getHTML())
      },
      editable: !disabled,
      immediatelyRender: false,
    })

    const addLink = useCallback(() => {
      if (!editor) return

      const url = window.prompt("링크 URL을 입력하세요:")
      if (url) {
        editor.chain().focus().setLink({ href: url }).run()
      }
    }, [editor])

    const removeLink = useCallback(() => {
      if (!editor) return
      editor.chain().focus().unsetLink().run()
    }, [editor])

    if (!editor) {
      return <div className={cn(editorStyles({ variant, size }), className)} ref={ref} />
    }

    return (
      <div ref={ref} className={cn(editorStyles({ variant, size }), className)} {...props}>
        {showToolbar && (
          <div className={toolbarStyles({ sticky: stickyToolbar })}>
            {/* 텍스트 스타일 */}
            <ToolbarButton
              isActive={editor.isActive("bold")}
              onClick={() => editor.chain().focus().toggleBold().run()}
              title="굵게 (Ctrl+B)">
              <Bold className="h-4 w-4" />
            </ToolbarButton>

            <ToolbarButton
              isActive={editor.isActive("italic")}
              onClick={() => editor.chain().focus().toggleItalic().run()}
              title="기울임 (Ctrl+I)">
              <Italic className="h-4 w-4" />
            </ToolbarButton>

            <ToolbarButton
              isActive={editor.isActive("code")}
              onClick={() => editor.chain().focus().toggleCode().run()}
              title="인라인 코드">
              <Code className="h-4 w-4" />
            </ToolbarButton>

            <Separator orientation="vertical" className="h-6" />

            {/* 리스트 */}
            <ToolbarButton
              isActive={editor.isActive("bulletList")}
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              title="불릿 리스트">
              <List className="h-4 w-4" />
            </ToolbarButton>

            <ToolbarButton
              isActive={editor.isActive("orderedList")}
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              title="번호 리스트">
              <ListOrdered className="h-4 w-4" />
            </ToolbarButton>

            <ToolbarButton
              isActive={editor.isActive("blockquote")}
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              title="인용구">
              <Quote className="h-4 w-4" />
            </ToolbarButton>

            <Separator orientation="vertical" className="h-6" />

            {/* 링크 */}
            <ToolbarButton
              isActive={editor.isActive("link")}
              onClick={editor.isActive("link") ? removeLink : addLink}
              title={editor.isActive("link") ? "링크 제거" : "링크 추가"}>
              <LinkIcon className="h-4 w-4" />
            </ToolbarButton>

            <Separator orientation="vertical" className="h-6" />

            {/* 실행 취소/다시 실행 */}
            <ToolbarButton
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editor.can().chain().focus().undo().run()}
              title="실행 취소 (Ctrl+Z)">
              <Undo className="h-4 w-4" />
            </ToolbarButton>

            <ToolbarButton
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editor.can().chain().focus().redo().run()}
              title="다시 실행 (Ctrl+Y)">
              <Redo className="h-4 w-4" />
            </ToolbarButton>
          </div>
        )}

        <EditorContent
          editor={editor}
          className={cn(contentStyles({ variant: contentVariant }), disabled && "cursor-not-allowed opacity-50")}
        />
      </div>
    )
  },
)
RichTextEditor.displayName = "RichTextEditor"
