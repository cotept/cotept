import { create } from "zustand"
import { devtools, persist } from "zustand/middleware"
import { shallow } from "zustand/shallow"

import type { MentorIntroData, MentorTagsData } from "@/features/onboarding/lib/validations/onboarding-rules"
import type { OnboardingCreateMentorProfileDto } from "@repo/api-client"

interface MentorState {
  tags: Partial<MentorTagsData>
  intro: Partial<MentorIntroData>
  isComplete: boolean

  // Actions
  setJobTag: (id: number) => void
  setLevelTag: (id: number) => void
  setCompanyTag: (id: number) => void
  setIntroTitle: (title: string) => void
  setIntroContent: (content: string) => void
  setMentorProfile: (data: OnboardingCreateMentorProfileDto) => void
  reset: () => void
}

export const useMentorStore = create<MentorState>()(
  devtools(
    persist(
      (set) => ({
        tags: {},
        intro: {},
        isComplete: false,

        setJobTag: (id) =>
          set((state) => {
            const tags = { ...state.tags, jobTagId: id }
            return {
              tags,
              isComplete:
                !!tags.jobTagId && !!tags.levelTagId && !!tags.companyTagId && !!state.intro.introductionContent,
            }
          }),

        setLevelTag: (id) =>
          set((state) => {
            const tags = { ...state.tags, levelTagId: id }
            return {
              tags,
              isComplete:
                !!tags.jobTagId && !!tags.levelTagId && !!tags.companyTagId && !!state.intro.introductionContent,
            }
          }),

        setCompanyTag: (id) =>
          set((state) => {
            const tags = { ...state.tags, companyTagId: id }
            return {
              tags,
              isComplete:
                !!tags.jobTagId && !!tags.levelTagId && !!tags.companyTagId && !!state.intro.introductionContent,
            }
          }),

        setIntroTitle: (title) =>
          set((state) => ({
            intro: { ...state.intro, introductionTitle: title },
          })),

        setIntroContent: (content) =>
          set((state) => {
            const intro = { ...state.intro, introductionContent: content }
            return {
              intro,
              isComplete:
                !!state.tags.jobTagId &&
                !!state.tags.levelTagId &&
                !!state.tags.companyTagId &&
                !!intro.introductionContent,
            }
          }),

        setMentorProfile: (data) => {
          const [jobTagId, levelTagId, companyTagId] = data.tagIds
          set({
            tags: { jobTagId, levelTagId, companyTagId },
            intro: {
              introductionTitle: data.introductionTitle || undefined,
              introductionContent: data.introductionContent,
            },
            isComplete: true,
          })
        },

        reset: () =>
          set({
            tags: {},
            intro: {},
            isComplete: false,
          }),
      }),
      { name: "onboarding-mentor" },
    ),
    { name: "Mentor" },
  ),
)

// Selector hooks
export const useMentorTagIds = () => useMentorStore((state) => (state.tags, shallow))

export const useMentorIntroContent = () => useMentorStore((state) => (state.intro.introductionContent, shallow))

export const useMentorIntroTitle = () => useMentorStore((state) => (state.intro.introductionTitle, shallow))

export const useIsMentorComplete = () => useMentorStore((state) => (state.isComplete, shallow))

export const useMentorData = () =>
  useMentorStore((state) => ({
    tags: state.tags,
    intro: state.intro,
    shallow,
  }))
