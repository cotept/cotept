"use client"

import { useMentors } from "@/features/mentoring/hooks/useMentors"

export default function MentoringList({ mentors }: { mentors: any }) {
  console.log(mentors)
  return (
    <ul>
      {mentors.map((mentor: any) => (
        <li key={mentor.id}>
          {mentor.name} - {mentor.role} - {mentor.field}
        </li>
      ))}
    </ul>
  )
}
