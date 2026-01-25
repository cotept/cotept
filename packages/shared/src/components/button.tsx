import { Slot } from "@radix-ui/react-slot"
import { cn } from "@repo/shared/lib/utils"
import { cva, type VariantProps } from "class-variance-authority"
import * as React from "react"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive cursor-pointer",
  {
    variants: {
      variant: {
        default: "bg-primary/90 text-primary-foreground shadow-xs hover:bg-primary",
        secondary: "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80", // Pink Button
        tertiary: "bg-tertiary text-tertiary-foreground shadow-xs hover:bg-tertiary/80", // Blue Button
        outline:
          "border border-input bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-accent dark:hover:bg-accent/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        inverted: "bg-zinc-100 text-zinc-900 shadow-sm hover:bg-zinc-300 transition-colors duration-150",
        destructive:
          "bg-destructive text-destructive-foreground shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20",

        // Custom Auth Variants
        "auth-primary":
          "bg-primary/90 text-primary-foreground shadow-xs hover:bg-primary focus-visible:ring-primary/20 disabled:bg-muted disabled:text-muted-foreground",
        "auth-secondary":
          "bg-muted text-muted-foreground shadow-xs hover:bg-muted/80 focus-visible:ring-ring/20 disabled:opacity-50", // Gray Button
        "auth-special":
          "bg-gradient-to-r from-primary to-secondary text-static-white font-semibold shadow-xs hover:from-primary-shade hover:to-secondary-shade focus-visible:ring-primary/20 disabled:from-muted disabled:to-muted disabled:text-muted-foreground", // Purple -> Pink
        "cta-primary":
          "bg-gradient-to-r from-primary to-tertiary text-static-white shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:scale-[1.01] active:scale-95 transition-all", // Purple -> Blue
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        xl: "h-12 rounded-md px-6 has-[>svg]:px-4",
        "2xl": "h-14 rounded-md px-8 text-base has-[>svg]:px-6",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return <Comp data-slot="button" className={cn(buttonVariants({ variant, size, className }))} {...props} />
}

export { Button, buttonVariants }
