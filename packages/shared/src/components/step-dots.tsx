import { cn } from "@repo/shared/lib/utils"

interface StepDotsProps<TStep extends string> {
  totalSteps: number
  currentStepIndex: number
  isStepCompleted: (step: TStep) => boolean
  stepOrder: readonly TStep[]
}

export function StepDots<TStep extends string>({
  totalSteps,
  currentStepIndex,
  isStepCompleted,
  stepOrder,
}: StepDotsProps<TStep>) {
  return (
    <div className="mb-4 flex justify-center space-x-2">
      {Array.from({ length: totalSteps }).map((_, index) => (
        <div
          key={index}
          className={cn("h-2 w-2 rounded-full", {
            "bg-purple-400": index === currentStepIndex,
            "bg-gray-400": index !== currentStepIndex && isStepCompleted(stepOrder[index]),
            "bg-gray-600": index !== currentStepIndex && !isStepCompleted(stepOrder[index]),
          })}
        />
      ))}
    </div>
  )
}
