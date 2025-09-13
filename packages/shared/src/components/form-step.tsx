"use client"

import { cva, type VariantProps } from "class-variance-authority"
import React from "react"

import { cn } from "../lib/utils"

const formStepVariants = cva(
  "space-y-6", // 기본 간격 설정
  {
    variants: {
      spacing: {
        compact: "space-y-4",
        normal: "space-y-6",
        relaxed: "space-y-8",
      },
      align: {
        left: "",
        center: "text-center",
      },
    },
    defaultVariants: {
      spacing: "normal",
      align: "left",
    },
  },
)

const formStepTitleVariants = cva("font-semibold text-white", {
  variants: {
    size: {
      sm: "text-lg",
      md: "text-xl",
      lg: "text-2xl",
    },
  },
  defaultVariants: {
    size: "md",
  },
})

const formStepDescriptionVariants = cva("text-zinc-400", {
  variants: {
    size: {
      sm: "text-xs",
      md: "text-sm",
      lg: "text-base",
    },
  },
  defaultVariants: {
    size: "md",
  },
})

export interface FormStepProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof formStepVariants>,
    VariantProps<typeof formStepTitleVariants> {
  /**
   * 단계 제목
   */
  title: string
  /**
   * 단계 설명 (선택사항)
   */
  description?: string
  /**
   * 부가 설명 (선택사항)
   */
  subDescription?: string
  /**
   * 제목 앞에 표시할 아이콘 (선택사항)
   */
  icon?: React.ReactNode
  /**
   * 제목과 설명 사이의 간격 조절
   */
  headerSpacing?: "compact" | "normal"
}

const FormStep = React.forwardRef<HTMLDivElement, FormStepProps>(
  ({ 
    className, 
    spacing, 
    align,
    size, 
    title, 
    description, 
    subDescription,
    icon,
    headerSpacing = "normal", 
    children, 
    ...props 
  }, ref) => {
    return (
      <div ref={ref} className={cn(formStepVariants({ spacing, align }), className)} {...props}>
        {/* 제목 및 설명 헤더 */}
        <div className={cn("space-y-2", headerSpacing === "compact" && "space-y-1")}>
          {/* 제목 (아이콘 + 텍스트) */}
          <div className={cn("flex items-center gap-2", align === "center" && "justify-center")}>
            {icon && <span className="shrink-0">{icon}</span>}
            <h2 className={cn(formStepTitleVariants({ size }))}>{title}</h2>
          </div>
          
          {/* 주 설명 */}
          {description && (
            <p className={cn(formStepDescriptionVariants({ size }))}>
              {description}
            </p>
          )}
          
          {/* 부 설명 */}
          {subDescription && (
            <p className={cn(formStepDescriptionVariants({ size }), "text-zinc-500")}>
              {subDescription}
            </p>
          )}
        </div>

        {/* 폼 컨텐츠 */}
        {children}
      </div>
    )
  },
)

FormStep.displayName = "FormStep"

export { FormStep, formStepVariants }
