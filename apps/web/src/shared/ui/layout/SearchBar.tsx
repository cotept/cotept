"use client"

import { useState } from "react"

import { Input } from "@repo/shared/components/input"

import { Search } from "lucide-react"

export function SearchBar() {
  const [isFocused, setIsFocused] = useState(false)

  return (
    <div className="group relative w-full">
      <Search
        className={`absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 transition-colors ${
          isFocused ? "text-foreground" : "text-muted-foreground"
        }`}
      />
      <Input
        type="text"
        placeholder="멘토, 기술스택, 알고리즘 검색..."
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className="border-border bg-muted focus:border-foreground focus:ring-foreground h-auto rounded-full py-2.5 pl-10 pr-4 focus-visible:ring-1"
      />
    </div>
  )
}
