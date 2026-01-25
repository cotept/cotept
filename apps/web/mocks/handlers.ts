import { http, HttpResponse } from "msw"
import { mentor } from "./data"

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL

export const handlers = [
  // 사용자 API 핸들러
  http.get(`${baseUrl}/api/users`, () => {
    return HttpResponse.json(mentor)
  }),

  http.get(`${baseUrl}/api/users/:id`, ({ params }) => {
    const user = mentor.find((mentor) => mentor.id === params.id)

    if (!user) {
      return new HttpResponse(null, { status: 404 })
    }

    return HttpResponse.json(user)
  }),
]
