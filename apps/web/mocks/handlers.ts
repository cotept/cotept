import { http, HttpResponse } from 'msw'
import { mentor } from "./data"

// const baseUrl = process.env.NEXT_PUBLIC_BASE_URL

 const handlers = [
  // 사용자 API 핸들러
  http.get(`http://localhost:3000/api/users`, () => {
    return HttpResponse.json(mentor, { status: 200 })
  }),

  http.get(`http://localhost:3000/api/users/:id`, ({ params }) => {
    const user = mentor.find((mentor) => mentor.id === params.id)

    if (!user) {
      return new HttpResponse(null, { status: 404 })
    }

    return HttpResponse.json(user, { status: 200 })
  }),
]

export default handlers;
