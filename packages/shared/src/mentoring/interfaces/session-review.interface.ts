// session-review.interface.ts
import { ReviewRating } from "../types/session.types"

export interface ISessionReview {
  id: string
  sessionId: string
  rating: ReviewRating // 1-5 평점
  content: string // 리뷰 내용
  createdAt: Date
  updatedAt: Date
}
