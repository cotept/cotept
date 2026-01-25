"use client"

import { cn } from "@repo/shared/lib/utils"
import { cva, type VariantProps } from "class-variance-authority"
import React from "react"

/**
 * 개별 유효성 검사 항목
 */
export interface ValidationCheck {
  /** 고유 식별자 */
  id: string
  /** 표시할 검사 조건 텍스트 */
  label: string
  /** 현재 검사 통과 여부 */
  isValid: boolean
  /** 추가 설명 (선택사항) */
  description?: string
}

/**
 * ValidationIndicator CVA 스타일 variants
 */
const validationIndicatorVariants = cva("space-y-2", {
  variants: {
    variant: {
      default: "",
      compact: "space-y-1",
      spaced: "space-y-3",
    },
    size: {
      sm: "",
      md: "",
      lg: "",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "md",
  },
})

/**
 * ValidationCheck Item CVA 스타일 variants
 */
const validationCheckVariants = cva("flex items-center transition-colors duration-200", {
  variants: {
    size: {
      sm: "space-x-1.5",
      md: "space-x-2",
      lg: "space-x-3",
    },
  },
  defaultVariants: {
    size: "md",
  },
})

/**
 * ValidationCheck Indicator CVA 스타일 variants
 */
const validationIndicatorDotVariants = cva("rounded-full transition-colors duration-200", {
  variants: {
    size: {
      sm: "h-1.5 w-1.5",
      md: "h-2 w-2",
      lg: "h-2.5 w-2.5",
    },
    state: {
      valid: "bg-green-500",
      invalid: "bg-red-500",
      neutral: "bg-zinc-400",
    },
  },
  defaultVariants: {
    size: "md",
    state: "neutral",
  },
})

/**
 * ValidationCheck Text CVA 스타일 variants
 */
const validationTextVariants = cva("transition-colors duration-200", {
  variants: {
    size: {
      sm: "text-xs",
      md: "text-sm",
      lg: "text-base",
    },
    state: {
      valid: "text-zinc-400",
      invalid: "text-zinc-400",
      neutral: "text-zinc-400",
    },
  },
  defaultVariants: {
    size: "md",
    state: "neutral",
  },
})

/**
 * ValidationIndicator 컴포넌트 Props
 */
export interface ValidationIndicatorProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof validationIndicatorVariants> {
  /** 유효성 검사 항목들 */
  checks: ValidationCheck[]
  /** 제목 (선택사항) */
  title?: string
  /** 표시 조건 (기본: 항상 표시) */
  showWhen?: "always" | "hasInput"
  /** 입력값 (showWhen="hasInput"일 때 필요) */
  inputValue?: string
  /** 필드가 터치되었는지 여부 (isDirty 상태) */
  isDirty?: boolean
}

/**
 * 재사용 가능한 유효성 검사 인디케이터 컴포넌트 (CVA 기반)
 *
 * @example
 * ```tsx
 * const checks: ValidationCheck[] = [
 *   { id: 'length', label: '8자 이상', isValid: password.length >= 8 },
 *   { id: 'special', label: '특수문자 포함', isValid: /[!@#$%^&*]/.test(password) }
 * ]
 *
 * <ValidationIndicator
 *   checks={checks}
 *   title="비밀번호 조건"
 *   variant="compact"
 *   size="sm"
 * />
 * ```
 */
export function ValidationIndicator({
  checks,
  title,
  variant,
  size,
  className,
  showWhen = "always",
  inputValue = "",
  isDirty = false,
  ...props
}: ValidationIndicatorProps) {
  // 표시 조건 확인
  const shouldShow = showWhen === "always" || (showWhen === "hasInput" && inputValue.length > 0)

  if (!shouldShow) {
    return null
  }

  // isDirty 기반 상태 결정: 터치하기 전엔 neutral, 터치 후엔 실제 validation 상태
  const getCheckState = (isValid: boolean) => {
    if (!isDirty) return "neutral" // 터치하지 않았으면 중립
    return isValid ? "valid" : "invalid" // 터치했으면 실제 상태
  }

  const getTextState = (isValid: boolean) => {
    if (!isDirty) return "neutral" // 터치하지 않았으면 중립
    return isValid ? "valid" : "invalid" // 터치했으면 실제 상태
  }

  return (
    <div className={cn(validationIndicatorVariants({ variant, size }), className)} {...props}>
      {title && <p className={cn("font-medium text-zinc-300", size === "sm" ? "text-xs" : "text-sm")}>{title}</p>}
      <div className={variant === "compact" ? "space-y-1" : "space-y-1.5"}>
        {checks.map((check) => (
          <div key={check.id} className={validationCheckVariants({ size })}>
            <div
              className={validationIndicatorDotVariants({
                size,
                state: getCheckState(check.isValid),
              })}
            />
            <span
              className={validationTextVariants({
                size,
                state: getTextState(check.isValid),
              })}>
              {check.label}
            </span>
            {check.description && <span className={cn("text-xs text-zinc-500")}>{check.description}</span>}
          </div>
        ))}
      </div>
    </div>
  )
}
