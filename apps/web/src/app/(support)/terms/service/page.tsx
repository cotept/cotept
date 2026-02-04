import { Metadata } from "next"

import { TermsServiceContainer } from "@/containers/support/pages/TermsServiceContainer"

export const metadata: Metadata = {
  title: "이용약관 | CotePT",
  description: "CotePT 코딩테스트 멘토링 플랫폼 이용약관",
}

export default function TermsServicePage() {
  return <TermsServiceContainer />
}
