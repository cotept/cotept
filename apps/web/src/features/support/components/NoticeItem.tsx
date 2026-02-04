import { Badge } from "@repo/shared/components/badge"

import { Pin } from "lucide-react"

import { Notice, NOTICE_CATEGORY_LABELS } from "../model/support.types"

interface NoticeItemProps {
  notice: Notice
}

export function NoticeItem({ notice }: NoticeItemProps) {
  return (
    <article className="py-4">
      <div className="flex items-start gap-3">
        {notice.isPinned && <Pin className="text-primary mt-1 h-4 w-4 shrink-0" />}
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {NOTICE_CATEGORY_LABELS[notice.category]}
            </Badge>
            <span className="text-muted-foreground text-xs">{notice.createdAt}</span>
          </div>
          <h2 className="text-foreground mb-1 text-base font-medium">{notice.title}</h2>
          <p className="text-muted-foreground line-clamp-2 text-sm">{notice.content}</p>
        </div>
      </div>
    </article>
  )
}
