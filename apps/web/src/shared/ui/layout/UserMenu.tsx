"use client"

import { signOut, useSession } from "next-auth/react"
import Link from "next/link"

import { Avatar } from "@repo/shared/components/avatar"
import { Button } from "@repo/shared/components/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@repo/shared/components/dropdown-menu"

import { LogOut, LucideIcon, User } from "lucide-react"

// ============================================
// Types
// ============================================
interface MenuItemBase {
  label: string
  icon: LucideIcon
}

interface LinkMenuItem extends MenuItemBase {
  type: "link"
  href: string
}

interface ActionMenuItem extends MenuItemBase {
  type: "action"
  onClick: () => void
}

type MenuItem = LinkMenuItem | ActionMenuItem

interface AuthButtonConfig {
  label: string
  href: string
  variant?: "default" | "outline"
}

// ============================================
// Menu Configuration
// ============================================
const userMenuItems: MenuItem[] = [
  {
    type: "link",
    label: "마이페이지",
    href: "/my",
    icon: User,
  },
  {
    type: "action",
    label: "로그아웃",
    onClick: () => signOut({ callbackUrl: "/main" }),
    icon: LogOut,
  },
]

const guestButtons: AuthButtonConfig[] = [
  { label: "로그인", href: "/auth/signin", variant: "outline" },
  { label: "회원가입", href: "/auth/signup", variant: "default" },
]

// ============================================
// Components
// ============================================
function UserDropdownMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="relative h-9 w-9 rounded-full">
          <Avatar className="h-9 w-9" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        {userMenuItems.map((item) => (
          <DropdownMenuItem
            key={item.label}
            asChild={item.type === "link"}
            onClick={item.type === "action" ? item.onClick : undefined}
            className="hover:text-primary-tint focus:text-primary cursor-pointer">
            {item.type === "link" ? (
              <Link href={item.href}>
                <item.icon className="mr-2 h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            ) : (
              <>
                <item.icon className="mr-2 h-4 w-4" />
                <span>{item.label}</span>
              </>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function GuestButtons() {
  return (
    <div className="flex items-center gap-2">
      {guestButtons.map((button) => (
        <Button key={button.href} variant={button.variant} size="sm" asChild>
          <Link href={button.href}>{button.label}</Link>
        </Button>
      ))}
    </div>
  )
}

// ============================================
// Main Component
// ============================================
export default function UserMenu() {
  const { data: session, status } = useSession()
  const isLoggedIn = status === "authenticated"
  const member = session?.member

  if (status === "loading") {
    return null
  }

  if (isLoggedIn && member) {
    return <UserDropdownMenu />
  }

  return <GuestButtons />
}
