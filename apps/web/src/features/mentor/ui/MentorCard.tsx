import { TierBadge } from "@repo/shared/components/tier-badge"
import { getTierFromIndex } from "@repo/shared/lib/tier-utils"

import type { Mentor } from "../model/mentor.types"

import { MentorCard as SharedMentorCard } from "@/shared/ui/mentor-card"

interface MentorCardProps {
  mentor: Mentor
}

export function MentorCard({ mentor }: MentorCardProps) {
  const { tier, rank } = getTierFromIndex(mentor.tierIndex)

  return (
    <SharedMentorCard>
      <SharedMentorCard.Header
        avatarUrl={mentor.imageUrl}
        avatarFallback={mentor.name.charAt(0)}
        name={mentor.name}
        badges={
          <div className="w-12">
            <TierBadge tier={tier} rank={rank} size="sm" />
          </div>
        }
        description={`${mentor.company} (${mentor.experience})`}
      />
      <SharedMentorCard.Body title={mentor.title} tags={mentor.tags} />
      <SharedMentorCard.Footer rating={mentor.rating} reviewCount={mentor.reviewCount} price={mentor.pricePerHour} />
    </SharedMentorCard>
  )
}
