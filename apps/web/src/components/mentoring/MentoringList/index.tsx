"use client"

import { useMentors } from "@/features/mentoring/hooks/useMentors"

export default function MentoringList() {
  const { mentors, isLoading, error } = useMentors()

  console.log("mentors", mentors)

  if (isLoading) return <div>로딩중...</div>
  if (error) return <div>에러 발생!</div>

  return (
    <ul>
      {mentors.map((mentor) => (
        <li key={mentor.id}>
          {mentor.name} - {mentor.field}
        </li>
      ))}
    </ul>
  )
}
