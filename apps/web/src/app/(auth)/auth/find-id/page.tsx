import { Metadata } from "next"

import FindIdContainer from "@/containers/auth/pages/FindIdContainer"
import GlobalContainer from "@/shared/ui/layout/GlobalContainer"

export const metadata: Metadata = {
  title: "CotePT - 아이디 찾기",
  description: "가입 시 등록한 정보로 아이디를 찾을 수 있습니다.",
  robots: { index: false },
}

export default function FindIdPage() {
  return (
    <GlobalContainer>
      <FindIdContainer />
    </GlobalContainer>
  )
}
