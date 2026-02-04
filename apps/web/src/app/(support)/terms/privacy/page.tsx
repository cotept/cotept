import { Metadata } from "next"

import { TermsPrivacyContainer } from "@/containers/support/pages/TermsPrivacyContainer"

export const metadata: Metadata = {
  title: "개인정보처리방침 | CotePT",
  description: "CotePT 코딩테스트 멘토링 플랫폼 개인정보처리방침",
}

export default function TermsPrivacyPage() {
  return <TermsPrivacyContainer />
}
