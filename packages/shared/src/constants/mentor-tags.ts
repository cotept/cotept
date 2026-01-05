export const MentorTagCategory = {
  JOB: "JOB",
  EXPERIENCE: "EXPERIENCE",
  COMPANY_SIZE: "COMPANY_SIZE",
  COMPANY_TYPE: "COMPANY_TYPE",
} as const

export type MentorTagCategory = (typeof MentorTagCategory)[keyof typeof MentorTagCategory]

export const MENTOR_JOB_TAGS = [
  { id: "frontend", label: "프론트엔드" },
  { id: "backend", label: "백엔드" },
  { id: "mobile", label: "모바일" },
  { id: "data-engineer", label: "데이터 엔지니어" },
  { id: "data-scientist", label: "데이터 사이언티스트" },
  { id: "ml-engineer", label: "ML/AI 엔지니어" },
  { id: "devops", label: "DevOps/인프라" },
  { id: "cloud-architect", label: "클라우드 아키텍트" },
  { id: "sre", label: "SRE" },
  { id: "security", label: "보안 엔지니어" },
  { id: "qa", label: "QA/테스트" },
  { id: "game-client", label: "게임 클라이언트" },
  { id: "game-server", label: "게임 서버" },
  { id: "pm", label: "프로덕트 매니저" },
  { id: "tech-lead", label: "테크 리드/아키텍트" },
] as const

export const MENTOR_EXPERIENCE_TAGS = [
  { id: "newbie", label: "신입" },
  { id: "junior", label: "주니어 (1~3년)" },
  { id: "mid", label: "미들 (4~6년)" },
  { id: "senior", label: "시니어 (7~10년)" },
  { id: "lead", label: "리드 (10년 이상)" },
] as const

export const COMPANY_SIZE_TAGS = [
  { id: "lt-10", label: "10명 미만" },
  { id: "10-49", label: "10~49명" },
  { id: "50-99", label: "50~99명" },
  { id: "100-299", label: "100~299명" },
  { id: "300-999", label: "300~999명" },
  { id: "gte-1000", label: "1000명 이상" },
] as const

export const COMPANY_TYPE_TAGS = [
  { id: "startup", label: "스타트업" },
  { id: "smb", label: "중소기업" },
  { id: "mid", label: "중견기업" },
  { id: "enterprise", label: "대기업" },
  { id: "global", label: "글로벌/외국계" },
  { id: "public", label: "공공/공기업" },
] as const

export type MentorSystemTag = (typeof MENTOR_JOB_TAGS)[number]
export type MentorJobTagId = (typeof MENTOR_JOB_TAGS)[number]["id"]
export type MentorExperienceTagId = (typeof MENTOR_EXPERIENCE_TAGS)[number]["id"]
export type CompanySizeTagId = (typeof COMPANY_SIZE_TAGS)[number]["id"]
export type CompanyTypeTagId = (typeof COMPANY_TYPE_TAGS)[number]["id"]

export const MENTOR_TAG_GROUPS = [
  { category: MentorTagCategory.JOB, tags: MENTOR_JOB_TAGS },
  { category: MentorTagCategory.EXPERIENCE, tags: MENTOR_EXPERIENCE_TAGS },
  { category: MentorTagCategory.COMPANY_SIZE, tags: COMPANY_SIZE_TAGS },
  { category: MentorTagCategory.COMPANY_TYPE, tags: COMPANY_TYPE_TAGS },
] as const
