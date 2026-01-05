"use client"

import React, { useEffect, useState } from "react"

import Link from "next/link"

import { Button } from "@repo/shared/components/button"

import { Terminal } from "lucide-react"

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
        <Link href="/" className="group flex cursor-pointer items-center gap-2">
          <div className="bg-brand-primary shadow-primary/30 flex h-8 w-8 items-center justify-center rounded-lg shadow-lg transition-transform group-hover:scale-105">
            <Terminal className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-black tracking-tight text-white">CotePT</span>
        </Link>

        <div className="flex items-center gap-2">
          <Link href="/auth/signin">
            <Button
              variant="secondary"
              className="text-base font-semibold text-white transition-colors hover:text-zinc-300">
              로그인
            </Button>
          </Link>
          {/* <Link href="/auth/signup">
            <Button variant="ghost" className="text-sm font-semibold text-white transition-colors hover:text-zinc-300">
              시작하기
            </Button>
          </Link> */}
        </div>
      </div>
    </header>
  )
}
