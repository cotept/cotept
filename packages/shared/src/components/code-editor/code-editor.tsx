import { cn } from "@repo/shared/lib/utils"
import { toJsxRuntime } from "hast-util-to-jsx-runtime"
import { Fragment, jsx, jsxs } from "react/jsx-runtime"
import { codeToHast } from "shiki"

import type { CodeEditorProps } from "./code-editor.types"
import { CodeEditorHeader } from "./code-editor-header"

/**
 * CodeEditor Server Component
 *
 * Shiki를 사용한 순수 디스플레이 구문 강조 컴포넌트.
 * 서버에서 렌더링되며 클라이언트 JavaScript 0KB.
 *
 * @example
 * ```tsx
 * <CodeEditor
 *   code="function hello() { return 'world' }"
 *   language="typescript"
 *   variant="default"
 *   showHeader
 *   showLineNumbers
 * />
 * ```
 */
export async function CodeEditor({
  code,
  language = "typescript",
  variant = "default",
  theme = "vitesse-dark",
  showHeader = variant === "default",
  showLineNumbers = variant !== "floating",
  startLineNumber = 1,
  highlightLines = [],
  rounded = "lg",
  className,
  ariaLabel,
  fileName,
}: CodeEditorProps) {
  // 코드에서 HAST 트리 생성
  const hast = await codeToHast(code, {
    lang: language,
    theme,
  })

  // HAST를 React 엘리먼트로 변환 (안전, dangerouslySetInnerHTML 사용 안 함)
  const syntaxHighlightedCode = toJsxRuntime(hast, {
    Fragment,
    jsx,
    jsxs,
  })

  // 테두리 둥글기 클래스 결정
  const roundedClasses = {
    sm: "rounded-sm",
    md: "rounded-md",
    lg: "rounded-lg",
    xl: "rounded-xl",
    "2xl": "rounded-2xl",
  }

  // 변형별 래퍼 클래스
  const variantClasses = {
    default: "border border-border bg-static-editor-bg overflow-hidden shadow-2xl",
    minimal: "border border-border bg-static-editor-code-bg overflow-hidden",
    floating: "border border-border/50 bg-static-editor-bg/95 overflow-hidden shadow-lg backdrop-blur-sm",
  }

  return (
    <div
      className={cn("font-mono text-xs sm:text-sm", roundedClasses[rounded], variantClasses[variant], className)}
      role="region"
      aria-label={ariaLabel || `${language} 코드 스니펫`}>
      {/* 헤더 (선택, default variant에서만) */}
      {showHeader && variant === "default" && <CodeEditorHeader fileName={fileName} />}

      {/* 코드 내용 */}
      <div className="bg-static-editor-code-bg p-4 text-gray-300 sm:p-6">
        {showLineNumbers ? (
          <div className="flex gap-3 sm:gap-4">
            {/* 라인 번호 */}
            <div className="select-none text-right text-gray-600" aria-hidden="true">
              {code.split("\n").map((_, index) => {
                const lineNum = startLineNumber + index
                const isHighlighted = highlightLines.includes(lineNum)
                return (
                  <div key={lineNum} className={cn(isHighlighted && "text-primary font-bold")}>
                    {String(lineNum).padStart(2, "0")}
                  </div>
                )
              })}
            </div>

            {/* 구문 강조된 코드 */}
            <div className="flex-1 overflow-x-auto">{syntaxHighlightedCode}</div>
          </div>
        ) : (
          <div className="overflow-x-auto">{syntaxHighlightedCode}</div>
        )}
      </div>
    </div>
  )
}
