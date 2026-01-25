"use client"

import { cva, type VariantProps } from "class-variance-authority"
import React from "react"

import { cn } from "../lib/utils"

const statusMessageVariants = cva("rounded-lg border p-4 text-center", {
  variants: {
    variant: {
      success: "border-success/20 bg-success/10",
      compelete: "border-success/20 bg-gradient-to-b from-success/10 to-transparent",
      error: "border-destructive/20 bg-destructive/10",
      warning: "border-warning/20 bg-warning/10",
      info: "border-info/20 bg-info/10",
      processing: "border-primary/20 bg-primary/10",
      transparent: "bg-transparent",
    },
    shape: {
      fill: "",
      outline: "bg-transparent",
    },
  },
  defaultVariants: {
    variant: "info",
    shape: "fill",
  },
})

const statusMessageTextVariants = cva("text-sm", {
  variants: {
    variant: {
      success: "text-success",
      compelete: "text-success",
      error: "text-destructive",
      warning: "text-warning",
      info: "text-info",
      processing: "text-primary",
      transparent: "text-foreground",
    },
  },
  defaultVariants: {
    variant: "info",
  },
})

export interface StatusMessageProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof statusMessageVariants> {
  message: string
  /**
   * 추가 아이콘이나 컴포넌트를 메시지 앞에 표시
   */
  icon?: React.ReactNode
  /**
   * 메시지 아래 추가 액션 버튼 등을 표시
   */
  children?: React.ReactNode
}

const StatusMessage = React.forwardRef<HTMLDivElement, StatusMessageProps>(
  ({ className, variant, shape, message, icon, children, ...props }, ref) => {
    return (
      <div ref={ref} className={cn(statusMessageVariants({ variant, shape }), className)} {...props}>
        <div className="flex items-center justify-center gap-2">
          {icon && <span className="shrink-0">{icon}</span>}
          <p className={cn(statusMessageTextVariants({ variant }))}>{message}</p>
        </div>
        {children && <div className="mt-3">{children}</div>}
      </div>
    )
  },
)

StatusMessage.displayName = "StatusMessage"

export { StatusMessage, statusMessageVariants }
