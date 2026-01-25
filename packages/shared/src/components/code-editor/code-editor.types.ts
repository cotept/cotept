/**
 * CodeEditor 컴포넌트 타입 정의
 * 순수 디스플레이 전용 구문 강조 코드 컴포넌트
 * Next.js Server Components 지원, 클라이언트 JavaScript 0KB
 */

import type { BundledLanguage, BundledTheme } from "shiki"

export interface CodeEditorProps {
  /**
   * 표시할 소스 코드
   */
  code: string

  /**
   * 구문 강조를 위한 프로그래밍 언어
   * @default "typescript"
   */
  language?: BundledLanguage

  /**
   * 에디터의 시각적 변형
   * - default: 헤더, 라인 번호, 컨트롤이 포함된 전체 에디터
   * - minimal: 구문 강조만 적용된 간단한 코드 블록
   * - floating: 오버레이용 컴팩트 에디터
   * @default "default"
   */
  variant?: "default" | "minimal" | "floating"

  /**
   * 구문 강조에 사용할 Shiki 테마
   * @default "vitesse-dark"
   */
  theme?: BundledTheme

  /**
   * 트래픽 라이트 컨트롤이 있는 헤더 표시 여부
   * @default true (default variant에서)
   */
  showHeader?: boolean

  /**
   * 라인 번호 표시 여부
   * @default true (default와 minimal variant에서)
   */
  showLineNumbers?: boolean

  /**
   * 시작 라인 번호 (코드 스니펫에 유용)
   * @default 1
   */
  startLineNumber?: number

  /**
   * 강조할 라인 번호 배열 (1부터 시작하는 인덱스)
   * @example [3, 5, 7] - 3번, 5번, 7번 라인을 강조
   */
  highlightLines?: number[]

  /**
   * 테두리 둥글기 크기
   * @default "lg"
   */
  rounded?: "sm" | "md" | "lg" | "xl" | "2xl"

  /**
   * 추가 CSS 클래스
   */
  className?: string

  /**
   * 스크린 리더를 위한 접근성 라벨
   */
  ariaLabel?: string

  /**
   * 헤더에 표시할 파일명 (default variant에서만)
   */
  fileName?: string
}

/**
 * CodeEditorHeader 내부 Props
 */
export interface CodeEditorHeaderProps {
  fileName?: string
  className?: string
}
