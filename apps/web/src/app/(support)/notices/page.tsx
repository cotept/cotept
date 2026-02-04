import { Metadata } from "next"

import { NoticesContainer } from "@/containers/support/pages/NoticesContainer"

export const metadata: Metadata = {
  title: "공지사항 | CotePT",
  description: "CotePT 서비스 관련 공지사항",
}

export default function NoticesPage() {
  return <NoticesContainer />
}
