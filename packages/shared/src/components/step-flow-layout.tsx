import React from "react"

export interface StepFlowLayoutProps {
  children: React.ReactNode
}

const StepFlowLayout = ({ children }: StepFlowLayoutProps) => {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-black p-4">
      <div className="w-full">{children}</div>
    </div>
  )
}

export default StepFlowLayout
