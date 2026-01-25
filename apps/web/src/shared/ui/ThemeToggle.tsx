"use client"

import { useTheme } from "next-themes"

import { Button } from "@repo/shared/components/button"

import { Moon, Sun } from "lucide-react"

import { useMounted } from "@/shared/hooks/useMounted"

const ThemeToggle = () => {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const mounted = useMounted()

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  // Use resolvedTheme for consistent SSR/CSR rendering
  // resolvedTheme is 'dark' or 'light' (never undefined)
  const isDark = resolvedTheme === "dark"

  // Prevent hydration mismatch by rendering a placeholder or avoiding theme-specific rendering until mounted
  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="text-muted-foreground hover:text-primary hover:bg-accent rounded-full">
        <div className="h-5 w-5" /> {/* Placeholder size */}
      </Button>
    )
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="text-muted-foreground hover:text-primary hover:bg-accent rounded-full">
      {isDark ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
    </Button>
  )
}

export default ThemeToggle
