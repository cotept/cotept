import { UserRole } from "@/modules/users/enums/user-role.enum"

export interface JwtPayload {
  sub: string // 사용자 ID
  email: string // 이메일
  role: UserRole // 사용자 역할
  deviceId?: string // 디바이스 ID (선택)
  iat?: number // 토큰 발급 시간
  exp?: number // 토큰 만료 시간
}

export interface TokenPair {
  accessToken: string
  refreshToken: string
}

export interface AuthenticatedUser {
  id: string
  email: string
  role: UserRole
  bojId: string
  currentTier?: string
}

export interface VerificationResult {
  success: boolean
  message: string
  remainingAttempts?: number
  expiresIn?: number
}

export interface SocialProfile {
  id: string
  email: string
  provider: string
  name?: string
  picture?: string
}

export interface RefreshTokenInfo {
  userId: string
  tokenId: string
  deviceId?: string
  expiresAt: number
}
