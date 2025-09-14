import { cn } from "@repo/shared/lib/utils"
import { cva, type VariantProps } from "class-variance-authority"
import { ComponentProps } from "react"

// 기존 스타일을 default variant로 정의하고, underline variant 추가
const inputStyles = cva("", {
  variants: {
    variant: {
      default:
        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
    },
  },
  defaultVariants: {
    variant: "default",
  },
})

type InputProps = ComponentProps<"input"> & VariantProps<typeof inputStyles>

function Input({ className, type, variant, ...props }: InputProps) {
  return <input type={type} data-slot="input" className={cn(inputStyles({ variant }), className)} {...props} />
}

export { Input }
