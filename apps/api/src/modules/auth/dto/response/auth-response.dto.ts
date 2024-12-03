import { UserRole } from "@/modules/users/enums/user-role.enum"

export class AuthResponseDto {
  user: {
    id: string
    email: string
    role: UserRole
    bojId: string
    currentTier?: string
  }

  // 실제 토큰은 쿠키로 전송되므로 응답에는 포함되지 않음
  // accessToken과 refreshToken은 HttpOnly 쿠키로 전송됨
}
