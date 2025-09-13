import Link from "next/link"

import { Button } from "@repo/shared/components/button"

export default function Home() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="mb-4 text-2xl font-bold">HOME</h1>
      <Button variant={"destructive"}>코테피티 화이팅</Button>
      <Link href="/auth/signup" className="text-blue-500 hover:underline">
        회원가입
      </Link>
    </div>
  )
}
