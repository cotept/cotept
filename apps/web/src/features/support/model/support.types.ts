// Legal Document Types
export interface LegalSubsection {
  id: string
  title: string
  content: string
  items?: string[]
}

export interface LegalSection {
  id: string
  title: string
  content: string | string[]
  subsections?: LegalSubsection[]
}

export interface LegalDocument {
  title: string
  effectiveDate: string
  lastUpdated: string
  version: string
  sections: LegalSection[]
}

// Notice Types
export type NoticeCategory = "service" | "policy" | "maintenance" | "event"

export interface Notice {
  id: string
  title: string
  category: NoticeCategory
  content: string
  createdAt: string
  isPinned: boolean
}

export const NOTICE_CATEGORY_LABELS: Record<NoticeCategory, string> = {
  service: "서비스",
  policy: "정책",
  maintenance: "점검",
  event: "이벤트",
}
