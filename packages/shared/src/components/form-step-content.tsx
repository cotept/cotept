import React from "react"

export interface FormStepContentProps {
  children: React.ReactNode
}

const FormStepContent = ({ children }: FormStepContentProps) => {
  return (
    <div className="mx-auto w-full max-w-md">
      <div className="space-y-6 rounded-xl border border-zinc-700/50 bg-zinc-800/50 p-7">{children}</div>
    </div>
  )
}

export default FormStepContent
