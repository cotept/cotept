import { create } from "zustand"
import { devtools, persist } from "zustand/middleware"
import { shallow } from "zustand/shallow"

import type { ProfileSetupData } from "@/features/onboarding/lib/validations/onboarding-rules"
import type { CreateBasicProfileDto } from "@repo/api-client"

interface ProfileState {
  profile: Partial<ProfileSetupData>
  isComplete: boolean

  // Actions
  setUserId: (id: string) => void
  setNickname: (nickname: string) => void
  setProfileImageUrl: (url: string) => void
  setProfile: (data: CreateBasicProfileDto) => void
  reset: () => void
}

export const useProfileStore = create<ProfileState>()(
  devtools(
    persist(
      (set) => ({
        profile: {},
        isComplete: false,

        setUserId: (id) => set((state) => ({ profile: { ...state.profile, userId: id } })),

        setNickname: (nickname) =>
          set((state) => ({
            profile: { ...state.profile, nickname },
            isComplete: !!nickname && !!state.profile.profileImageUrl,
          })),

        setProfileImageUrl: (url) =>
          set((state) => ({
            profile: { ...state.profile, profileImageUrl: url },
          })),

        setProfile: (data) =>
          set({
            profile: data,
            isComplete: true,
          }),

        reset: () =>
          set({
            profile: {},
            isComplete: false,
          }),
      }),
      {
        name: "onboarding-profile",
        partialize: (state) => ({ profile: state.profile }),
      },
    ),
    { name: "Profile" },
  ),
)

// Selector hooks
export const useProfileNickname = () => useProfileStore((state) => (state.profile.nickname, shallow))

export const useProfileImageUrl = () => useProfileStore((state) => (state.profile.profileImageUrl, shallow))

export const useIsProfileComplete = () => useProfileStore((state) => (state.isComplete, shallow))

export const useProfileData = () => useProfileStore((state) => (state.profile, shallow))
