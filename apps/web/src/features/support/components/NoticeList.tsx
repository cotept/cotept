import { Notice } from "../model/support.types"

import { NoticeItem } from "./NoticeItem"

interface NoticeListProps {
  notices: Notice[]
}

export function NoticeList({ notices }: NoticeListProps) {
  // Sort: pinned first, then by date (newest first)
  const sortedNotices = [...notices].sort((a, b) => {
    if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-8">
        <h1 className="text-foreground text-2xl font-bold sm:text-3xl">공지사항</h1>
        <p className="text-muted-foreground mt-2">서비스 관련 중요 안내사항을 확인하세요.</p>
      </header>

      {sortedNotices.length > 0 ? (
        <div className="divide-border divide-y">
          {sortedNotices.map((notice) => (
            <NoticeItem key={notice.id} notice={notice} />
          ))}
        </div>
      ) : (
        <div className="text-muted-foreground py-12 text-center">등록된 공지사항이 없습니다.</div>
      )}
    </div>
  )
}
