import { Badge } from "@repo/shared/components/badge"

import type { MentorTagDto } from "@repo/api-client/src/types/mentor-tag-dto"

import { MentorCard } from "@/shared/ui/mentor-card"

type MentorProfilePreviewCardProps = {
  nickname?: string
  profileImageUrl?: string | null
  jobTag?: MentorTagDto
  levelTag?: MentorTagDto
  companySizeTag?: MentorTagDto
  companyTypeTag?: MentorTagDto
  introductionTitle?: string
  introductionContent?: string // 리스트 뷰에서는 사용되지 않지만 인터페이스 유지를 위해 남김
  isSubmitted?: boolean
  className?: string
}

export function MentorProfilePreviewCard({
  nickname,
  profileImageUrl,
  jobTag,
  levelTag,
  companySizeTag,
  companyTypeTag,
  introductionTitle,
  isSubmitted = false,
  className,
}: MentorProfilePreviewCardProps) {
  const avatarFallback = nickname?.charAt(0)?.toUpperCase() ?? "?"
  const badges = [jobTag, levelTag, companySizeTag, companyTypeTag].filter(Boolean) as MentorTagDto[]

  return (
    <div className={className}>
      <MentorCard>
        <MentorCard.Header
          avatarUrl={profileImageUrl}
          avatarFallback={avatarFallback}
          name={nickname || "닉네임"}
          description="소속 정보 (예: 토스, 3년차)" // 미리보기용 플레이스홀더
          badges={
            <div className="flex gap-1.5">
              <Badge variant="outline" className="border-primary/20 bg-primary/5 text-primary h-5 px-1.5 text-[10px]">
                PLATINUM
              </Badge>
            </div>
          }
        />
        <MentorCard.Body
          title={introductionTitle || "멘토링에 대한 한 줄 소개를 입력해주세요."}
          tagsNode={
            badges.length > 0 ? (
              badges.map((tag) => (
                <Badge
                  key={tag.idx}
                  variant="outline"
                  className="border-primary/20 bg-primary/5 text-primary rounded-lg px-2.5 py-1 text-xs font-semibold">
                  {tag.name}
                </Badge>
              ))
            ) : (
              // 태그가 없을 때 보여줄 플레이스홀더 태그
              <>
                <Badge variant="outline" className="text-muted-foreground border-dashed opacity-50">
                  #직무
                </Badge>
                <Badge variant="outline" className="text-muted-foreground border-dashed opacity-50">
                  #연차
                </Badge>
              </>
            )
          }
        />
        <MentorCard.Footer
          customLeft={
            <Badge
              variant="outline"
              className={
                isSubmitted
                  ? "border-purple-500/50 bg-purple-500/10 text-purple-600 dark:text-purple-400"
                  : "border-green-500/50 bg-green-500/10 text-green-600 dark:text-green-400"
              }>
              {isSubmitted ? "제출 완료" : "작성 중"}
            </Badge>
          }
          // customRight={
          //   <div className="flex items-center gap-1 text-sm">
          //     <span className="font-bold">30,000원</span>
          //     <span className="text-muted-foreground text-xs">/시간</span>
          //   </div>
          // }
        />
      </MentorCard>
    </div>
  )
}
