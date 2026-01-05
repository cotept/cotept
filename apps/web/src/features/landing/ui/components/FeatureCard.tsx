import * as React from "react"

import { cn } from "@repo/shared/lib/utils"

import { cva, type VariantProps } from "class-variance-authority"

// -----------------------------------------------------------------------------
// Root Component
// -----------------------------------------------------------------------------

const featureCardVariants = cva(
  "group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.07] to-white/[0.02] p-8 transition-all duration-300",
  {
    variants: {
      variant: {
        default: "hover:border-primary/40 text-left",
        center:
          "hover:border-primary/40 flex flex-col items-center text-center hover:shadow-primary/5 bg-white/5 hover:shadow-2xl",
        simple: "hover:border-primary/50 hover:shadow-primary/5 bg-white/5 hover:shadow-2xl text-left", // PainPoints 스타일 흡수
      },
      active: {
        true: "shadow-[0_0_30px_rgba(124,59,237,0.1)] border border-primary/50",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      active: false,
    },
  },
)

interface FeatureCardProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof featureCardVariants> {
  children: React.ReactNode
  showGlow?: boolean // 우측 상단 Glow 효과 여부
}

export function FeatureCard({ className, variant, active, showGlow = true, children, ...props }: FeatureCardProps) {
  return (
    <div className={cn(featureCardVariants({ variant, active }), className)} {...props}>
      {/* Background Glow Effect (Feature 스타일) */}
      {showGlow && (
        <div className="bg-brand-primary/10 group-hover:bg-brand-primary/20 absolute -right-8 -top-8 h-32 w-32 rounded-full blur-2xl transition-all duration-500" />
      )}
      {/* Active State Background Glow */}
      {active && <div className="bg-brand-primary/20 absolute inset-0 -z-10 blur-3xl transition-all" />}

      {children}
    </div>
  )
}

// -----------------------------------------------------------------------------
// Icon Component
// -----------------------------------------------------------------------------

const featureIconVariants = cva("flex items-center justify-center transition-all duration-300", {
  variants: {
    variant: {
      default: "mb-6 h-12 w-12 rounded-lg",
      circle: "mb-4 h-14 w-14 rounded-full",
    },
    active: {
      true: "bg-brand-primary text-white",
      false: "bg-white/10 text-zinc-400",
      primary: "bg-brand-primary/20 text-brand-primary", // 기본 Feature 스타일
    },
  },
  defaultVariants: {
    variant: "default",
    active: "primary", // 기본값을 primary로 설정하여 기존 Feature 스타일 유지
  },
})

interface FeatureCardIconProps
  extends React.HTMLAttributes<HTMLDivElement>,
    Omit<VariantProps<typeof featureIconVariants>, "active"> {
  icon: React.ElementType
  iconClassName?: string
  active?: boolean | "primary" // active 타입을 확장
}

export function FeatureCardIcon({
  className,
  variant,
  active,
  icon: Icon,
  iconClassName,
  ...props
}: FeatureCardIconProps) {
  // active가 boolean이면 true/false 문자열로, undefined면 defaultVariant('primary') 사용
  // Verification에서 active={step.active} (boolean)로 넘기므로 호환성 유지됨

  return (
    <div className={cn(featureIconVariants({ variant, active: active as any }), className)} {...props}>
      <Icon className={cn("h-6 w-6", iconClassName)} />
    </div>
  )
}

// -----------------------------------------------------------------------------
// Typography Components
// -----------------------------------------------------------------------------

export function FeatureCardTitle({ className, children, ...props }: React.ComponentProps<"h3">) {
  return (
    <h3 className={cn("mb-2 text-lg font-bold leading-tight text-white", className)} {...props}>
      {children}
    </h3>
  )
}

export function FeatureCardDescription({ className, children, ...props }: React.ComponentProps<"p">) {
  return (
    <p className={cn("text-sm leading-relaxed text-zinc-400", className)} {...props}>
      {children}
    </p>
  )
}
