"use client"

import React, { useEffect, useState } from "react"

import Link from "next/link"

import { Button } from "@repo/shared/components/button"

import Logo from "@/shared/ui/Logo"

export const LandingHeader = () => {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header
      className={`fixed left-0 right-0 top-0 z-50 border-b transition-all duration-300 ${
        isScrolled ? "bg-background/80 h-16 border-white/10 backdrop-blur-md" : "h-20 border-transparent bg-transparent"
      }`}>
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-6">
        <Link href="/" className="group flex cursor-pointer items-center justify-center gap-2">
          <Logo size={"sm"} variant={"primary"} margin={false} />
        </Link>

        <div className="flex items-center gap-2">
          <Link href="/auth/signin">
            <Button
              variant="default"
              size={"sm"}
              className="text-static-white text-base font-semibold transition-colors">
              로그인
            </Button>
          </Link>
        </div>
      </div>
    </header>
  )
}
