//token.types.ts
import { AccountStatus } from "../../users/base"
import { MentorApprovalStatus } from "../../users/mentor/enums/mentor-approval-status.enum"

export interface ITokenPayload {
  sub: string // 사용자 ID
  type: "MENTOR" | "MENTEE"
  approvalStatus?: MentorApprovalStatus // 멘토의 경우
  accountStatus: AccountStatus // 공통 계정 상태
}

export interface IRefreshTokenPayload extends ITokenPayload {
  jti: string // 토큰 고유 ID
  deviceId: string // 기기 식별
  iat: number // 발급 시간
  exp: number // 만료 시간
  rotationCount: number // 재발급 횟수
}

export interface ITokenRevocation {
  tokenId: string
  userId: string
  reason: "LOGOUT" | "SECURITY_BREACH" | "PASSWORD_CHANGE" | "ADMIN_ACTION"
  revokedAt: number
  deviceId?: string
}

export interface ITokenBlacklist {
  key: `blacklist:${string}`
  value: {
    exp: number
    reason: string
  }
}
