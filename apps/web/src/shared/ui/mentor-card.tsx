import React from "react"

import Link from "next/link"

import { Avatar, AvatarFallback, AvatarImage } from "@repo/shared/components/avatar"
import { Badge } from "@repo/shared/components/badge"
import { Card, CardContent, CardFooter } from "@repo/shared/components/card"
import { cn } from "@repo/shared/lib/utils"

import { Star } from "lucide-react"

/**
 * MentorCard Compound Component
 *
 * @example
 * <MentorCard>
 *   <MentorCard.Header
 *     avatarUrl="..."
 *     name="홍길동"
 *     badges={<Badge>Lv.1</Badge>}
 *     description="카카오 (3년차)"
 *   />
 *   <MentorCard.Body
 *     title="프론트엔드 멘토링 합니다."
 *     tags={["React", "Next.js"]}
 *   />
 *   <MentorCard.Footer rating={4.8} reviewCount={12} price={15000} />
 * </MentorCard>
 */

interface MentorCardRootProps extends React.ComponentProps<typeof Card> {
  href?: string
}

function Root({ className, children, href, ...props }: MentorCardRootProps) {
  const CardComponent = (
    <Card
      className={cn(
        "bg-card group relative gap-0 overflow-hidden rounded-2xl border p-0 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl",
        className,
      )}
      {...props}>
      {children}
    </Card>
  )

  if (href) {
    return (
      <Link href={href} className="block h-full">
        {CardComponent}
      </Link>
    )
  }

  return CardComponent
}

interface MentorCardHeaderProps {
  avatarUrl?: string | null
  avatarFallback: string
  name: string
  badges?: React.ReactNode
  description: string
}

function Header({ avatarUrl, avatarFallback, name, badges, description }: MentorCardHeaderProps) {
  return (
    <CardContent className="flex flex-col gap-5 p-5 pb-0">
      <div className="flex items-start gap-4">
        <div className="relative flex-shrink-0">
          <Avatar className="border-background h-14 w-14 border-2 shadow-sm">
            {avatarUrl ? (
              <AvatarImage src={avatarUrl} alt={name} className="h-full w-full object-cover" width={56} height={56} />
            ) : null}
            <AvatarFallback>{avatarFallback}</AvatarFallback>
          </Avatar>
        </div>
        <div className="flex min-w-0 flex-col">
          <div className="flex items-center gap-2">
            <h3 className="text-foreground truncate text-base font-bold leading-tight">{name}</h3>
            {badges}
          </div>
          <p className="text-muted-foreground mt-1 truncate text-xs">{description}</p>
        </div>
      </div>
    </CardContent>
  )
}

interface MentorCardBodyProps {
  title: string
  tags?: string[]
  tagsNode?: React.ReactNode
}

function Body({ title, tags, tagsNode }: MentorCardBodyProps) {
  return (
    <CardContent className="flex flex-1 flex-col gap-3 p-5 pt-5">
      <h4 className="text-card-foreground group-hover:text-foreground/80 line-clamp-2 min-h-[2.75rem] text-[15px] font-semibold leading-snug transition-colors">
        {title}
      </h4>
      <div className="flex flex-wrap gap-1.5">
        {tags?.map((tag) => (
          <Badge
            key={tag}
            variant="outline"
            className="border-primary/20 bg-primary/5 text-primary rounded-lg px-2.5 py-1 text-xs font-semibold">
            {tag}
          </Badge>
        ))}
        {tagsNode}
      </div>
    </CardContent>
  )
}

interface MentorCardFooterProps {
  rating?: number
  reviewCount?: number
  price?: number
  unit?: string
  customLeft?: React.ReactNode
  customRight?: React.ReactNode
}

function Footer({
  rating = 0,
  reviewCount = 0,
  price,
  unit = "/시간",
  customLeft,
  customRight,
}: MentorCardFooterProps) {
  return (
    <CardFooter className="bg-muted/30 dark:bg-muted/10 flex items-center justify-between border-t px-5 py-3.5">
      <div className="flex items-center gap-1.5">
        {customLeft ? (
          customLeft
        ) : (
          <>
            <Star className="h-4 w-4 fill-current text-yellow-500" />
            <span className="text-foreground text-sm font-bold">{rating.toFixed(1)}</span>
            <span className="text-muted-foreground text-xs">({reviewCount})</span>
          </>
        )}
      </div>
      <div className="text-right">
        {customRight ? (
          customRight
        ) : price !== undefined ? (
          <>
            <span className="text-foreground text-sm font-bold">{price.toLocaleString()}원</span>
            <span className="text-muted-foreground ml-0.5 text-[10px]">{unit}</span>
          </>
        ) : null}
      </div>
    </CardFooter>
  )
}

export const MentorCard = Object.assign(Root, {
  Header,
  Body,
  Footer,
})
