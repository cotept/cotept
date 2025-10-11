import { create } from "zustand"
import { devtools, persist } from "zustand/middleware"
import { shallow } from "zustand/shallow"

import type { BaekjoonVerifyStartData } from "@/features/onboarding/lib/validations/onboarding-rules"
import type { BaekjoonProfileResponseDto } from "@repo/api-client"

interface BaekjoonState {
  verification: Partial<Pick<BaekjoonVerifyStartData, "baekjoonHandle">> & {
    verificationCode?: string
  }
  profile: Partial<BaekjoonProfileResponseDto>
  isVerified: boolean

  // Actions
  setBaekjoonHandle: (handle: string) => void
  setVerificationCode: (code: string) => void
  setVerified: (verified: boolean) => void
  setBaekjoonProfile: (profile: BaekjoonProfileResponseDto) => void
  reset: () => void
}

export const useBaekjoonStore = create<BaekjoonState>()(
  devtools(
    persist(
      (set) => ({
        verification: {},
        profile: {},
        isVerified: false,

        setBaekjoonHandle: (handle) =>
          set((state) => ({
            verification: { ...state.verification, baekjoonHandle: handle },
          })),

        setVerificationCode: (code) =>
          set((state) => ({
            verification: { ...state.verification, verificationCode: code },
          })),

        setVerified: (verified) => set({ isVerified: verified }),

        setBaekjoonProfile: (profile) =>
          set({
            profile,
            isVerified: true,
          }),

        reset: () =>
          set({
            verification: {},
            profile: {},
            isVerified: false,
          }),
      }),
      { name: "onboarding-baekjoon" },
    ),
    { name: "Baekjoon" },
  ),
)

// Selector hooks
export const useBaekjoonHandle = () => useBaekjoonStore((state) => (state.verification.baekjoonHandle, shallow))

export const useIsBaekjoonVerified = () => useBaekjoonStore((state) => (state.isVerified, shallow))

export const useBaekjoonTier = () => useBaekjoonStore((state) => (state.profile.tier, shallow))

export const useBaekjoonProfile = () => useBaekjoonStore((state) => (state.profile, shallow))
