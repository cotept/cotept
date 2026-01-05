"use client"

import type { Dispatch, SetStateAction } from "react"

import { Button } from "@repo/shared/components/button"

import type { OnboardingData } from "@/features/onboarding/lib/validations/onboarding-rules"
import { ONBOARDING_STEPS, type OnboardingStep } from "@/shared/types/basic-types"

const PRESETS: Record<
  string,
  {
    label: string
    data: Partial<OnboardingData>
    step: OnboardingStep
  }
> = {
  profileOnly: {
    label: "Profile → Baekjoon",
    data: {
      profile: {
        nickname: "디버거",
        profileImageUrl: "",
      },
    },
    step: ONBOARDING_STEPS.BAEKJOON_VERIFY,
  },
  mentorReady: {
    label: "Mentor Ready",
    data: {
      profile: {
        nickname: "디버거",
        profileImageUrl: "",
      },
      baekjoonVerification: { baekjoonHandle: "debug_handle", verificationSessionId: "debug-session" },
      mentorProfile: {
        tags: {
          jobTagId: 1,
          levelTagId: 1,
          companySizeTagId: 1,
          companyTypeTagId: 1,
        },
        intro: {
          introductionTitle: "멘토 소개 예시",
          introductionContent: "<p>멘토 소개가 충분히 작성되었습니다.</p>",
        },
      },
    },
    step: ONBOARDING_STEPS.MENTOR_SETUP,
  },
  complete: {
    label: "Complete Step (Mentor)",
    data: {
      profile: {
        nickname: "디버거(멘토)",
        profileImageUrl: "",
      },
      baekjoonVerification: { baekjoonHandle: "complete_user", verificationSessionId: "complete-session" },
      mentorProfile: {
        tags: {
          jobTagId: 1,
          levelTagId: 1,
          companySizeTagId: 1,
          companyTypeTagId: 1,
        },
        intro: {
          introductionTitle: "완료된 멘토 소개",
          introductionContent: "<p>온보딩 완료용 소개글입니다.</p>",
        },
      },
      wantsToBeMentor: true,
      isMentorEligible: true,
    },
    step: ONBOARDING_STEPS.COMPLETE,
  },
  complete_mentee_eligible: {
    label: "Complete Step (Mentee/not eligible)",
    data: {
      profile: {
        nickname: "디버거(멘티)",
        profileImageUrl: "",
      },
      baekjoonVerification: { baekjoonHandle: "complete_user", verificationSessionId: "complete-session" },
      wantsToBeMentor: false,
      isMentorEligible: false,
    },
    step: ONBOARDING_STEPS.COMPLETE,
  },
  complete_mentee: {
    label: "Complete Step (Mentee/eligible)",
    data: {
      profile: {
        nickname: "디버거(멘티)",
        profileImageUrl: "",
      },
      baekjoonVerification: { baekjoonHandle: "complete_user", verificationSessionId: "complete-session" },
      wantsToBeMentor: false,
      isMentorEligible: true,
    },
    step: ONBOARDING_STEPS.COMPLETE,
  },
}

interface OnboardingDebugPanelProps {
  setOnboardingData: Dispatch<SetStateAction<OnboardingData>>
  goToStep: (step: OnboardingStep) => void
  clearPersistedFlow: () => void
}

export function OnboardingDebugPanel({ setOnboardingData, goToStep, clearPersistedFlow }: OnboardingDebugPanelProps) {
  if (process.env.NEXT_PUBLIC_ONBOARDING_DEBUG !== "true") {
    return null
  }

  const handleApplyPreset = (presetKey: keyof typeof PRESETS) => {
    const preset = PRESETS[presetKey]
    if (!preset) return

    setOnboardingData((prev) => ({
      ...prev,
      ...preset.data,
    }))
    goToStep(preset.step)
  }

  const handleClearFlow = () => {
    setOnboardingData({} as OnboardingData)
    clearPersistedFlow()
    goToStep(ONBOARDING_STEPS.PROFILE_SETUP)
  }

  return (
    <div className="mx-auto mt-6 max-w-3xl rounded-lg border border-dashed border-purple-500/50 bg-purple-950/30 p-4 text-xs text-white">
      <p className="mb-3 font-semibold">Onboarding Debug Panel</p>
      <div className="flex flex-wrap gap-2">
        {Object.entries(PRESETS).map(([key, preset]) => (
          <Button
            key={key}
            size="sm"
            variant="secondary"
            onClick={() => handleApplyPreset(key as keyof typeof PRESETS)}>
            {preset.label}
          </Button>
        ))}
        <Button size="sm" variant="destructive" onClick={handleClearFlow}>
          Clear Progress
        </Button>
      </div>
    </div>
  )
}
