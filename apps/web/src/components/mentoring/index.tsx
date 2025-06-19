import React from "react"
import MentoringList from "./MentoringList"
import { getMentors } from "@/features/mentoring/apis/getMentors"

export default async function Mentoring() {
  const response = await getMentors()

  return (
    <div>
      <MentoringList mentors={response} />
    </div>
  )
}
