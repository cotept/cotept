import Link from "next/link"

import { Button } from "@repo/shared/components/button"

import { Bell, Search } from "lucide-react"

import UserMenu from "@/shared/ui/layout/UserMenu"
import Logo from "@/shared/ui/Logo"
import ThemeToggle from "@/shared/ui/ThemeToggle"

export function GlobalHeader() {
  return (
    <header className="border-border bg-background/80 sticky top-0 z-50 w-full border-b backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Link href="/" className="group flex cursor-pointer items-center justify-start gap-2">
            <Logo size={"sm"} variant={"primary"} margin={false} />
          </Link>
          <nav className="hidden items-center gap-6 md:flex">
            <Link href="#" className="text-primary text-base font-semibold transition-colors">
              멘토링
            </Link>
            <Link
              href="#"
              className="text-muted-foreground hover:text-primary text-base font-semibold transition-colors">
              다시보기
            </Link>
            <Link
              href="#"
              className="text-muted-foreground hover:text-primary text-base font-semibold transition-colors">
              대시보드
            </Link>
          </nav>
        </div>

        <div className="mx-8 hidden max-w-lg flex-1 md:flex">
          <div className="group relative w-full">
            <Search className="text-muted-foreground group-focus-within:text-primary absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 transition-colors" />
            <input
              type="text"
              placeholder="멘토, 기술스택, 알고리즘 검색..."
              className="border-border bg-bg-4/50 text-foreground placeholder:text-muted-foreground focus:border-ring focus:ring-ring w-full rounded-full border py-2.5 pl-10 pr-4 text-sm outline-none transition-all focus:ring-1"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <ThemeToggle />

          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-primary hover:bg-accent rounded-full">
              <Bell className="h-5 w-5" />
              <span className="ring-background bg-destructive absolute right-2 top-2 h-2 w-2 rounded-full ring-2"></span>
            </Button>
          </div>

          <UserMenu />
        </div>
      </div>
    </header>
  )
}
