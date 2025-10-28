import React from "react"

export interface StepFlowLayoutProps {
  children: React.ReactNode
}

const StepFlowLayout = ({ children }: StepFlowLayoutProps) => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-black p-4">
      <div className="w-full max-w-md">{children}</div>
    </div>
  )
}

export default StepFlowLayout
