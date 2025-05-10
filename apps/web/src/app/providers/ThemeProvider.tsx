import type { PropsWithChildren } from "react"
import { createContext, useContext, useEffect, useState } from "react"

type Theme = "light" | "dark"

type ThemeContextType = {
  theme: Theme
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}

const ThemeProvider = ({ children }: PropsWithChildren) => {
  // 브라우저 로컬 스토리지의 테마 정보 가져오기
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("theme") as Theme
      return savedTheme || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
    }
    return "light"
  })

  // 테마 전환 함수
  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"))
  }

  // 테마 변경시 HTML 요소에 클래스를 추가하거나 제거
  useEffect(() => {
    const root = window.document.documentElement

    if (theme === "dark") {
      root.classList.add("dark")
    } else {
      root.classList.remove("dark")
    }

    // 로컬 스토리지에 현재 테마 저장
    localStorage.setItem("theme", theme)
  }, [theme])

  const value = {
    theme,
    toggleTheme,
  }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export default ThemeProvider
