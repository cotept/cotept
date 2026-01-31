import Link from "next/link"

import { Button } from "@repo/shared/components/button"

import { Bell, Search } from "lucide-react"

import UserMenu from "@/shared/ui/layout/UserMenu"
import Logo from "@/shared/ui/Logo"
import ThemeToggle from "@/shared/ui/ThemeToggle"

export function GlobalHeader() {
  return (
    <header className="border-border bg-background/80 sticky top-0 z-50 w-full border-b backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        {/* Left: Logo & Navigation */}
        <div className="flex shrink-0 items-center gap-6 lg:gap-8">
          <Link href="/" className="group flex cursor-pointer items-center justify-start gap-2">
            <Logo size={"sm"} variant={"primary"} margin={false} />
          </Link>
          {/* 스크린 리더 전용 */}
          <nav className="hidden items-center gap-5 md:flex lg:gap-6 [&>*]:sr-only" aria-label="Global Navigation">
            <Link
              href="#"
              aria-label="VOD Replay"
              className="text-muted-foreground hover:text-primary text-sm font-semibold transition-colors lg:text-base">
              다시보기
            </Link>
            <Link
              href="#"
              aria-label="Dashboard"
              className="text-muted-foreground hover:text-primary text-sm font-semibold transition-colors lg:text-base">
              대시보드
            </Link>
            <Link
              href="#"
              aria-label="my page"
              className="text-muted-foreground hover:text-primary text-sm font-semibold transition-colors lg:text-base">
              마이페이지
            </Link>
          </nav>
        </div>

        {/* Center: Search Bar (Desktop/Tablet) */}
        <div className="hidden flex-1 items-center justify-center md:flex">
          <div className="group relative w-full max-w-md xl:max-w-lg">
            <Search className="text-muted-foreground group-focus-within:text-primary absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transition-colors" />
            <input
              type="text"
              placeholder="멘토, 기술스택 검색..."
              className="border-border bg-bg-4/50 text-foreground placeholder:text-muted-foreground focus:border-ring focus:ring-ring w-full rounded-full border py-2 pl-9 pr-4 text-sm outline-none transition-all focus:ring-1"
            />
          </div>
        </div>

        {/* Right: User Menu & Mobile Actions */}
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          {/* Mobile Search Icon */}
          <Button variant="ghost" size="icon" className="text-muted-foreground rounded-full md:hidden">
            <Search className="h-5 w-5" />
          </Button>

          <ThemeToggle />

          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-primary hover:bg-accent rounded-full">
              <Bell className="h-5 w-5" />
              <span className="ring-background bg-destructive absolute right-2.5 top-2.5 h-1.5 w-1.5 rounded-full ring-2"></span>
            </Button>
          </div>

          <UserMenu />
        </div>
      </div>
    </header>
  )
}
