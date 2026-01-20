import { cn } from "@repo/shared/lib/utils"

import type { CodeEditorHeaderProps } from "./code-editor.types"

/**
 * CodeEditor 헤더 컴포넌트
 * macOS 스타일의 트래픽 라이트 컨트롤과 선택적 파일명 표시
 */
export function CodeEditorHeader({ fileName, className }: CodeEditorHeaderProps) {
  return (
    <div
      className={cn(
        "border-static-editor-border flex items-center gap-2 border-b bg-[#252526] px-3 py-2 sm:px-4 sm:py-3",
        className,
      )}>
      {/* 트래픽 라이트 컨트롤 */}
      <div className="flex items-center gap-2">
        <div className="bg-destructive size-2.5 rounded-full sm:size-3" aria-hidden="true" />
        <div className="bg-warning size-2.5 rounded-full sm:size-3" aria-hidden="true" />
        <div className="bg-success size-2.5 rounded-full sm:size-3" aria-hidden="true" />
      </div>

      {/* 파일명 (선택) */}
      {fileName && <span className="ml-2 text-xs font-medium text-gray-400 sm:text-sm">{fileName}</span>}
    </div>
  )
}
