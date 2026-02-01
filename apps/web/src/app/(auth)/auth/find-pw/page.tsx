import { Metadata } from "next"

import ResetPasswordContainer from "@/containers/auth/pages/ResetPasswordContainer"
import GlobalContainer from "@/shared/ui/layout/GlobalContainer"

export const metadata: Metadata = {
  title: "CotePT - 비밀번호 찾기",
  description: "가입한 이메일로 인증 후 비밀번호를 재설정합니다.",
  robots: { index: false },
}

export default function ResetPasswordPage() {
  return (
    <GlobalContainer>
      <ResetPasswordContainer />
    </GlobalContainer>
  )
}
