import { cn } from "@repo/shared/lib/utils"
import React from "react"

export interface StepFlowLayoutProps {
  children: React.ReactNode
  className?: string
}

const StepFlowLayout = ({ children, className }: StepFlowLayoutProps) => {
  return (
    <section className="animate-in fade-in slide-in-from-bottom-4 relative flex min-h-screen w-full items-center justify-center p-4 duration-700">
      <div className={cn("w-full", className)}>{children}</div>
    </section>
  )
}

export default StepFlowLayout
