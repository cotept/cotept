import { NextRequest, NextResponse } from "next/server"

import { auth } from "@/auth"

const protectedRoutes = ["/protected"]

export default async function middleware(req: NextRequest) {
  const session = await auth()
  console.log("Session:", session)
  const pathname = req.nextUrl.pathname
  const { nextUrl } = req
  console.log(nextUrl.pathname)
  if (protectedRoutes.includes(pathname) && !session) {
    return NextResponse.redirect(new URL("/", req.url))
  }
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
