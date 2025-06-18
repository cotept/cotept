import { create } from "zustand"

interface Mentor {
  id: string
  name: string
  field?: string
}

interface MentorStore {
  mentors: Mentor[]
  setMentors: (mentors: Mentor[]) => void
}

export const useMentorStore = create<MentorStore>((set: any) => ({
  mentors: [],
  setMentors: (mentors: Mentor[]) => set({ mentors }),
}))
