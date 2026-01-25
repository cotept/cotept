import React from "react"

export interface FormStepContentProps {
  children: React.ReactNode
}

const FormStepContent = ({ children }: FormStepContentProps) => {
  return (
    <div className="mx-auto w-full max-w-md">
      <div className="border-border/50 bg-card/50 space-y-6 rounded-xl border p-7 shadow-lg">{children}</div>
    </div>
  )
}

export default FormStepContent
