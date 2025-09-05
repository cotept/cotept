"use client"

import React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../lib/utils"

const statusMessageVariants = cva(
  "rounded-lg border p-4 text-center",
  {
    variants: {
      variant: {
        success: "border-green-500/20 bg-green-500/10",
        error: "border-red-500/20 bg-red-500/10", 
        warning: "border-yellow-500/20 bg-yellow-500/10",
        info: "border-blue-500/20 bg-blue-500/10",
        processing: "border-purple-500/20 bg-purple-500/10",
      },
    },
    defaultVariants: {
      variant: "info",
    },
  }
)

const statusMessageTextVariants = cva(
  "text-sm",
  {
    variants: {
      variant: {
        success: "text-green-400",
        error: "text-red-400",
        warning: "text-yellow-400", 
        info: "text-blue-400",
        processing: "text-purple-400",
      },
    },
    defaultVariants: {
      variant: "info",
    },
  }
)

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
  ({ className, variant, message, icon, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(statusMessageVariants({ variant }), className)}
        {...props}
      >
        <div className="flex items-center justify-center gap-2">
          {icon && <span className="shrink-0">{icon}</span>}
          <p className={cn(statusMessageTextVariants({ variant }))}>
            {message}
          </p>
        </div>
        {children && (
          <div className="mt-3">
            {children}
          </div>
        )}
      </div>
    )
  }
)

StatusMessage.displayName = "StatusMessage"

export { StatusMessage, statusMessageVariants }