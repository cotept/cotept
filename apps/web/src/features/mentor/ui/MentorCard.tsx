import Image from "next/image"

import { Avatar, AvatarFallback, AvatarImage } from "@repo/shared/components/avatar"
import { Badge } from "@repo/shared/components/badge"
import { Card, CardContent, CardFooter } from "@repo/shared/components/card"
import { TierBadge } from "@repo/shared/components/tier-badge"
import { getTierFromIndex } from "@repo/shared/lib/tier-utils"

import { Star } from "lucide-react"

import type { Mentor } from "../model/mentor.types"

interface MentorCardProps {
  mentor: Mentor
}

export function MentorCard({ mentor }: MentorCardProps) {
  const { tier, rank } = getTierFromIndex(mentor.tierIndex)

  return (
    <Card className="border-border bg-background group relative gap-0 overflow-hidden rounded-2xl border p-0 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl">
      <CardContent className="flex flex-1 flex-col gap-5 p-5">
        <div className="flex items-start gap-4">
          <div className="relative flex-shrink-0">
            <Avatar className="border-background h-14 w-14 border-2 shadow-sm">
              <AvatarImage asChild>
                <Image
                  src={mentor.imageUrl}
                  alt={mentor.name}
                  width={56}
                  height={56}
                  className="h-full w-full object-cover"
                  unoptimized
                />
              </AvatarImage>
              <AvatarFallback>{mentor.name.charAt(0)}</AvatarFallback>
            </Avatar>
          </div>
          <div className="flex min-w-0 flex-col">
            <div className="flex items-center justify-center gap-2">
              <h3 className="text-foreground truncate text-base font-bold leading-tight">{mentor.name}</h3>
              <div className="w-12">
                <TierBadge tier={tier} rank={rank} size="sm" />
              </div>
            </div>
            <p className="text-muted-foreground mt-1 truncate text-xs">
              {mentor.company} ({mentor.experience})
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="text-card-foreground group-hover:text-foreground/50 line-clamp-2 min-h-[2.75rem] text-[15px] font-semibold leading-snug transition-colors">
            {mentor.title}
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {mentor.tags.map((tag) => (
              <Badge
                key={tag}
                variant="outline"
                className="border-primary/20 bg-primary/5 text-primary rounded-lg px-2.5 py-1 text-xs font-semibold">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>

      <CardFooter className="border-border bg-accent/50 justify-between border-t px-5 py-3.5">
        <div className="flex items-center gap-1.5">
          <Star className="h-4 w-4 fill-current text-yellow-400" />
          <span className="text-foreground text-sm font-bold">{mentor.rating.toFixed(1)}</span>
          <span className="text-muted-foreground text-xs">({mentor.reviewCount})</span>
        </div>
        <div className="text-right">
          <span className="text-foreground text-sm font-bold">{mentor.pricePerHour.toLocaleString()}원</span>
          <span className="text-muted-foreground ml-0.5 text-[10px]">/시간</span>
        </div>
      </CardFooter>
    </Card>
  )
}
