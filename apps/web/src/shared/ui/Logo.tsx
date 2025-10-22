"use client"

import { ReactNode } from "react"

import { cn } from "@repo/shared/lib/utils"

import { cva, type VariantProps } from "class-variance-authority"

/**
 * Logo 컴포넌트의 스타일 variants
 *
 * CVA를 사용하여 타입 안전하게 스타일 변형 관리
 */
const logoVariants = cva("text-center font-bold transition-opacity duration-200", {
  variants: {
    size: {
      sm: "text-xl",
      md: "text-3xl",
      lg: "text-4xl xl:text-5xl",
    },
    variant: {
      primary: "bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent",
      secondary: "bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent",
      accent: "bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent",
      mono: "text-gray-900 dark:text-gray-100",
    },
    clickable: {
      true: "cursor-pointer hover:opacity-80 active:opacity-60",
      false: "",
    },
    margin: {
      true: "mb-6",
      false: "",
    },
  },
  defaultVariants: {
    size: "md",
    variant: "primary",
    clickable: false,
    margin: true,
  },
})

const containerVariants = cva("", {
  variants: {
    margin: {
      true: "mb-8",
      false: "",
    },
  },
  defaultVariants: {
    margin: true,
  },
})

type LogoVariants = VariantProps<typeof logoVariants>

export interface LogoProps {
  /**
   * 로고 텍스트 (image가 없을 때 표시)
   * @default "COTEPT"
   */
  text?: string
  /**
   * 커스텀 이미지 또는 SVG 로고
   * image를 제공하면 text 대신 이미지가 렌더링됩니다
   */
  image?: ReactNode
  /**
   * 로고 크기
   * @default "md"
   */
  size?: LogoVariants["size"]
  /**
   * 색상 변형
   * @default "primary"
   */
  variant?: LogoVariants["variant"]
  /**
   * 클릭 가능 여부
   */
  clickable?: LogoVariants["clickable"]
  /**
   * 하단 여백 포함 여부
   * @default true
   */
  margin?: LogoVariants["margin"]
  /**
   * 클릭 이벤트 핸들러
   * 제공되면 자동으로 clickable: true 적용
   */
  onClick?: () => void
  /**
   * 추가 CSS 클래스
   */
  className?: string
}

/**
 * CotePT 브랜드 로고 컴포넌트
 *
 * CVA(Class Variance Authority)를 사용하여 다양한 스타일 변형 지원
 *
 * @example
 * ```tsx
 * // 기본 사용
 * <Logo />
 *
 * // 크기 및 색상 변형
 * <Logo size="lg" variant="secondary" />
 *
 * // 이미지 로고 (SVG/PNG)
 * <Logo image={<img src="/logo.svg" alt="CotePT" />} />
 *
 * // 클릭 가능한 로고 (홈으로 이동)
 * <Logo onClick={() => router.push('/')} />
 *
 * // 여백 없는 작은 로고 (헤더용)
 * <Logo size="sm" margin={false} />
 * ```
 */
const Logo = ({ text = "COTEPT", image, size, variant, clickable, margin, onClick, className }: LogoProps) => {
  // onClick이 제공되면 자동으로 clickable 활성화
  const isClickable = clickable ?? !!onClick

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (onClick && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault()
      onClick()
    }
  }

  return (
    <div
      className={cn(containerVariants({ margin }), className)}
      onClick={onClick}
      role={isClickable ? "button" : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={handleKeyDown}
      aria-label={onClick ? "홈으로 이동" : undefined}>
      {image ? (
        <div className="inline-flex items-center justify-center">{image}</div>
      ) : (
        <h1 className={logoVariants({ size, variant, clickable: isClickable, margin })}>{text}</h1>
      )}
    </div>
  )
}

export default Logo
