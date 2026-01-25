// components/ui/pulse-badge.tsx
import { cn } from "@repo/shared/lib/utils"
import { cva, type VariantProps } from "class-variance-authority"
import * as React from "react"

const pulseBadgeVariants = cva("inline-flex items-center gap-2 rounded-full border px-3 py-1", {
  variants: {
    variant: {
      default: "border-border bg-muted/50",
      primary: "border-primary/20 bg-primary/10",
      secondary: "border-secondary/20 bg-secondary/10",
      tertiary: "border-tertiary/20 bg-tertiary/10",
      success: "border-success/20 bg-success/10",
      warning: "border-warning/20 bg-warning/10",
      info: "border-info/20 bg-info/10",
      destructive: "border-destructive/20 bg-destructive/10",
    },
  },
  defaultVariants: {
    variant: "default",
  },
})

const pulseDotVariants = cva("h-2 w-2 rounded-full", {
  variants: {
    variant: {
      default: "bg-success",
      primary: "bg-primary",
      secondary: "bg-secondary",
      tertiary: "bg-tertiary",
      success: "bg-success",
      warning: "bg-warning",
      info: "bg-info",
      destructive: "bg-destructive",
    },
    pulse: {
      true: "animate-pulse",
      false: "",
    },
  },
  defaultVariants: {
    variant: "default",
    pulse: true,
  },
})

const pulseTextVariants = cva("text-xs font-semibold uppercase tracking-widest", {
  variants: {
    variant: {
      default: "text-accent-foreground",
      primary: "text-primary",
      secondary: "text-secondary",
      tertiary: "text-tertiary",
      success: "text-success",
      warning: "text-warning",
      info: "text-info",
      destructive: "text-destructive",
    },
  },
  defaultVariants: {
    variant: "default",
  },
})

export interface PulseBadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof pulseBadgeVariants> {
  pulse?: boolean
  showDot?: boolean
}

const PulseBadge = React.forwardRef<HTMLDivElement, PulseBadgeProps>(
  ({ className, variant, pulse = true, showDot = true, children, ...props }, ref) => {
    return (
      <div ref={ref} className={cn(pulseBadgeVariants({ variant }), className)} {...props}>
        {showDot && <span className={cn(pulseDotVariants({ variant, pulse }))} />}
        <span className={cn(pulseTextVariants({ variant }))}>{children}</span>
      </div>
    )
  },
)
PulseBadge.displayName = "PulseBadge"

export { PulseBadge, pulseBadgeVariants }
