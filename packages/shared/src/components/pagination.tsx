import { Button } from "@repo/shared/components/button"
import { cn } from "@repo/shared/lib/utils"
import { ChevronLeftIcon, ChevronRightIcon, MoreHorizontalIcon } from "lucide-react"
import * as React from "react"

function Pagination({ className, ...props }: React.ComponentProps<"nav">) {
  return (
    <nav
      role="navigation"
      aria-label="pagination"
      data-slot="pagination"
      className={cn("mx-auto flex w-full justify-center", className)}
      {...props}
    />
  )
}

function PaginationContent({ className, ...props }: React.ComponentProps<"ul">) {
  return <ul data-slot="pagination-content" className={cn("flex items-center gap-0.5", className)} {...props} />
}

function PaginationItem({ ...props }: React.ComponentProps<"li">) {
  return <li data-slot="pagination-item" {...props} />
}

type PaginationLinkProps = {
  /**
   * 페이지 활성 상태
   */
  isActive?: boolean
  /**
   * 커스텀 컴포넌트 (예: Next.js Link)
   * @example
   * ```tsx
   * import Link from "next/link"
   *
   * <PaginationLink as={Link} href="/page/2">
   *   2
   * </PaginationLink>
   * ```
   */
  as?: React.ElementType
} & Pick<React.ComponentProps<typeof Button>, "size"> &
  React.ComponentProps<"a">

function PaginationLink({ className, isActive, size = "icon", as: Component = "a", ...props }: PaginationLinkProps) {
  return (
    <Button asChild variant={isActive ? "outline" : "ghost"} size={size} className={cn(className)}>
      <Component
        aria-current={isActive ? "page" : undefined}
        data-slot="pagination-link"
        data-active={isActive}
        {...props}
      />
    </Button>
  )
}
type PaginationPreviousProps = {
  /**
   * 커스텀 텍스트 (기본값: "Previous")
   * @default "Previous"
   */
  text?: React.ReactNode
} & React.ComponentProps<typeof PaginationLink>

function PaginationPrevious({ className, text, ...props }: PaginationPreviousProps) {
  return (
    <PaginationLink aria-label="Go to previous page" size="default" className={cn("pl-2!", className)} {...props}>
      <ChevronLeftIcon data-icon="inline-start" />
      <span className="hidden sm:block">{text ?? "Previous"}</span>
    </PaginationLink>
  )
}

type PaginationNextProps = {
  /**
   * 커스텀 텍스트 (기본값: "Next")
   * @default "Next"
   */
  text?: React.ReactNode
} & React.ComponentProps<typeof PaginationLink>

function PaginationNext({ className, text, ...props }: PaginationNextProps) {
  return (
    <PaginationLink aria-label="Go to next page" size="default" className={cn("pr-2!", className)} {...props}>
      <span className="hidden sm:block">{text ?? "Next"}</span>
      <ChevronRightIcon data-icon="inline-end" />
    </PaginationLink>
  )
}

function PaginationEllipsis({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      aria-hidden
      data-slot="pagination-ellipsis"
      className={cn("flex size-7 items-center justify-center [&_svg:not([class*='size-'])]:size-3.5", className)}
      {...props}>
      <MoreHorizontalIcon />
      <span className="sr-only">More pages</span>
    </span>
  )
}

export {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
}
