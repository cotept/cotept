import { Notice } from "./support.types"

export const NOTICES_DATA: Notice[] = [
  {
    id: "notice-001",
    title: "CotePT 서비스 오픈 안내",
    category: "service",
    content:
      "CotePT 서비스가 정식 오픈되었습니다. 코딩테스트 준비에 최적화된 1:1 멘토링 플랫폼을 경험해보세요. solved.ac 플래티넘 3 이상의 현직 개발자 멘토와 함께 코딩테스트를 준비할 수 있습니다.",
    createdAt: "2024-01-01",
    isPinned: true,
  },
  {
    id: "notice-002",
    title: "개인정보처리방침 및 이용약관 제정 안내",
    category: "policy",
    content:
      "서비스 이용에 필요한 개인정보처리방침과 이용약관이 제정되었습니다. 서비스 이용 전 반드시 확인해주세요. 상세 내용은 각 페이지에서 확인하실 수 있습니다.",
    createdAt: "2024-01-01",
    isPinned: false,
  },
]
