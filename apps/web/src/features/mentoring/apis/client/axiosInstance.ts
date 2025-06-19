// features/mentoring/api/client/axiosInstance.ts

// 🏷️ 요청용 타입 (클라이언트 → 서버)
export interface CreateMentorRequest {
  name: string
  email: string
  password: string
  company: string
  position: string
  hourlyRate: number
  skills: string[]
  bio: string
}

export interface UpdateMentorRequest {
  name?: string
  company?: string
  position?: string
  hourlyRate?: number
  skills?: string[]
  bio?: string
  // password는 별도 API로 처리
}

// 🏷️ 응답용 타입 (서버 → 클라이언트)
export interface MentorResponse {
  id: string
  name: string
  email: string
  // password는 응답에 없음 ✅
  company: string
  position: string
  hourlyRate: number
  skills: string[]
  bio: string
  rating: number
  reviewCount: number
  isOnline: boolean
  isVerified: boolean
  profileImageUrl?: string
  createdAt: string
  updatedAt: string
  // 서버에서 추가된 필드들 ✅
}

// 📝 예약 관련
export interface CreateBookingRequest {
  mentorId: string
  sessionDate: string
  duration: number
  message?: string
}

export interface BookingResponse {
  id: string
  mentorId: string
  menteeId: string
  mentor: {
    // ✅ populated 된 객체
    id: string
    name: string
    company: string
    profileImageUrl?: string
  }
  mentee: {
    // ✅ populated 된 객체
    id: string
    name: string
    profileImageUrl?: string
  }
  sessionDate: string
  duration: number
  message?: string
  status: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED"
  createdAt: string
  updatedAt: string
  // 서버에서 계산된 필드들 ✅
  estimatedEndTime: string
  totalPrice: number
}
