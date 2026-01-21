"use client"

import { useMemo } from "react"

import { Avatar, AvatarFallback, AvatarImage } from "@repo/shared/components/avatar"
import { Badge } from "@repo/shared/components/badge"
import { Card, CardContent, CardHeader } from "@repo/shared/components/card"
import { sanitizeHtml } from "@repo/shared/lib/sanitize"
import { cn } from "@repo/shared/lib/utils"

import type { MentorTagDto } from "@repo/api-client/src/types/mentor-tag-dto"

type MentorProfilePreviewCardProps = {
  nickname?: string
  profileImageUrl?: string | null
  jobTag?: MentorTagDto
  levelTag?: MentorTagDto
  companySizeTag?: MentorTagDto
  companyTypeTag?: MentorTagDto
  introductionTitle?: string
  introductionContent?: string
  isSubmitted?: boolean
  className?: string
}

const PLACEHOLDER_TEXT = "본문을 작성하면 여기에 미리보기가 표시됩니다."

export function MentorProfilePreviewCard({
  nickname,
  profileImageUrl,
  jobTag,
  levelTag,
  companySizeTag,
  companyTypeTag,
  introductionTitle,
  introductionContent,
  isSubmitted = false,
  className,
}: MentorProfilePreviewCardProps) {
  const safeIntroduction = useMemo(() => sanitizeHtml(introductionContent ?? ""), [introductionContent])

  const avatarFallback = nickname?.charAt(0)?.toUpperCase() ?? "?"

  const badges = [jobTag, levelTag, companySizeTag, companyTypeTag].filter(Boolean) as MentorTagDto[]

  return (
    <Card className={cn("relative border-zinc-800 bg-zinc-900", className)}>
      <div className="absolute right-2 top-2">
        <Badge
          variant="outline"
          className={cn("text-xs", {
            "border-purple-500/50 bg-purple-500/10 text-purple-400": isSubmitted,
            "border-green-500/50 bg-green-500/10 text-green-400": !isSubmitted,
          })}>
          {isSubmitted ? "제출 완료" : "작성 중"}
        </Badge>
      </div>
      <CardHeader>
        <div className="flex items-center gap-4">
          <Avatar className="h-14 w-14">
            {profileImageUrl ? <AvatarImage src={profileImageUrl} alt={nickname ?? "멘토 아바타"} /> : null}
            <AvatarFallback className="bg-zinc-800 text-lg text-white">{avatarFallback}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-1">
            <p className="text-lg font-semibold text-white">{nickname ?? "멘토 닉네임"}</p>
            {badges.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {badges.map((tag) => (
                  <Badge key={tag.idx} variant="outline" className="border-zinc-700 text-xs text-zinc-200">
                    {tag.name}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-xs text-zinc-500">태그</p>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {introductionTitle ? (
          <p className="text-base font-semibold text-white">{introductionTitle}</p>
        ) : (
          <p className="text-sm text-zinc-500">제목을 입력해주세요.</p>
        )}

        {safeIntroduction ? (
          <div
            className="prose prose-invert prose-sm max-w-none text-zinc-100"
            dangerouslySetInnerHTML={{ __html: safeIntroduction }}
          />
        ) : (
          <p className="text-sm text-zinc-500">{PLACEHOLDER_TEXT}</p>
        )}
      </CardContent>
    </Card>
  )
}
