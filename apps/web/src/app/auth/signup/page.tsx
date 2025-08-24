import SignupContainer from "@/containers/auth/pages/SignupContainer"

export const metadata = {
  title: "CotePT - 회원가입",
  robots: { index: false }, // 인증 페이지 검색 노출 방지
}

export default function SignupPage() {
  return (
    //   <Suspense fallback={<SignupSkeleton />}>
    <SignupContainer />
    //   </Suspense>
  )
}
