// components/ui/pulse-badge.tsx
import { cn } from "@repo/shared/lib/utils"
import { cva, type VariantProps } from "class-variance-authority"
import * as React from "react"

const pulseBadgeVariants = cva("inline-flex items-center gap-2 rounded-full border px-3 py-1", {
  variants: {
    variant: {
      default: "border-white/10 bg-white/5",
      primary: "border-primary/20 bg-primary/10",
      success: "border-green-500/20 bg-green-500/10",
      info: "border-blue-500/20 bg-blue-500/10",
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
      default: "bg-green-400",
      primary: "bg-primary",
      success: "bg-green-400",
      info: "bg-blue-400",
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
      default: "text-zinc-300",
      primary: "text-primary",
      success: "text-green-400",
      info: "text-blue-400",
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
