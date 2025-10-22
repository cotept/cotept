import { create } from "zustand"
import { devtools } from "zustand/middleware"
import { shallow } from "zustand/shallow"

import {
  ONBOARDING_NAVIGABLE_STEPS,
  ONBOARDING_STEP_ORDER,
  ONBOARDING_STEPS,
  type OnboardingStep,
} from "@/shared/constants/basic-types"

// ===== 온보딩 플로우 스토어 (공통 진행 상태) =====

interface OnboardingFlowState {
  // Flow state (depth = 1)
  currentStep: OnboardingStep
  completedSteps: OnboardingStep[]

  // Actions
  setCurrentStep: (step: OnboardingStep) => void
  completeStep: (step: OnboardingStep) => void
  goToNextStep: () => void
  goToPrevStep: () => void
  reset: () => void
}

export const useOnboardingFlowStore = create<OnboardingFlowState>()(
  devtools(
    (set, get) => ({
      currentStep: ONBOARDING_STEPS.PROFILE_SETUP,
      completedSteps: [],

      setCurrentStep: (step) => set({ currentStep: step }),

      completeStep: (step) =>
        set((state) => ({
          completedSteps: state.completedSteps.includes(step) ? state.completedSteps : [...state.completedSteps, step],
        })),

      goToNextStep: () => {
        const current = get().currentStep
        const currentIndex = ONBOARDING_STEP_ORDER.indexOf(current)
        if (currentIndex < ONBOARDING_STEP_ORDER.length - 1) {
          set({ currentStep: ONBOARDING_STEP_ORDER[currentIndex + 1] })
        }
      },

      goToPrevStep: () => {
        const current = get().currentStep
        const currentIndex = ONBOARDING_NAVIGABLE_STEPS.indexOf(current)
        if (currentIndex > 0) {
          set({ currentStep: ONBOARDING_NAVIGABLE_STEPS[currentIndex - 1] })
        }
      },

      reset: () =>
        set({
          currentStep: ONBOARDING_STEPS.PROFILE_SETUP,
          completedSteps: [],
        }),
    }),
    { name: "OnboardingFlow" },
  ),
)

// Selector hooks (최적화)
export const useCurrentStep = () => useOnboardingFlowStore((state) => (state.currentStep, shallow))

export const useCompletedSteps = () => useOnboardingFlowStore((state) => (state.completedSteps, shallow))

export const useIsStepComplete = (step: OnboardingStep) =>
  useOnboardingFlowStore((state) => (state.completedSteps.includes(step), shallow))

export const useCanProceedToNext = () =>
  useOnboardingFlowStore((state) => {
    const current = state.currentStep
    return (state.completedSteps.includes(current), shallow)
  })
