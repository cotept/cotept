import { http, HttpResponse } from "msw"
import { mentor } from "../data"

export const mentorHandler = [
  // 사용자 API 핸들러
  http.get("/api/users", () => {
    return HttpResponse.json(mentor)
  }),

  http.get("/api/users/:id", ({ params }) => {
    const user = mentor.find((mentor) => mentor.id === params.id)

    if (!user) {
      return new HttpResponse(null, { status: 404 })
    }

    return HttpResponse.json(user)
  }),
]
