import { BaseApiService } from "../../api/core/base-api-service"
import { ApiResponse } from "../../api/core/types"

// 인증 관련 API 요청/응답 타입
interface LoginRequest {
  email: string
  password: string
}

interface LoginResponse {
  success: boolean
  accessToken: string
  refreshToken?: string
  role: "mentee" | "mentor" | "admin"
  userId?: string
  email?: string
  name?: string
}

interface ExchangeCodeRequest {
  code: string
}

interface ConfirmSocialLinkRequest {
  token: string
  confirm: boolean
}

export class AuthApiService extends BaseApiService {
  constructor() {
    super("/auth")
  }

  // 이메일/비밀번호 로그인
  async login(request: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    return this.post<LoginRequest, LoginResponse>("login", {
      body: request,
    })
  }

  // 소셜 로그인 인증 코드를 토큰으로 교환
  async exchangeAuthCode(code: string): Promise<ApiResponse<LoginResponse>> {
    return this.post<ExchangeCodeRequest, LoginResponse>("exchange-code", {
      body: { code },
    })
  }

  // 소셜 계정 연결 확인
  async confirmSocialLink(token: string, confirm: boolean): Promise<ApiResponse<{ code?: string }>> {
    return this.post<ConfirmSocialLinkRequest, { code?: string }>("confirm-social-link", {
      body: { token, confirm },
    })
  }

  // 로그아웃
  async logout(): Promise<ApiResponse<void>> {
    return this.post("logout", { body: {} })
  }

  // 토큰 갱신
  async refreshToken(): Promise<ApiResponse<LoginResponse>> {
    return this.post("slient-refresh", { body: {} })
  }

  // 토큰 검증
  async validateToken(token: string): Promise<ApiResponse<{ isValid: boolean }>> {
    return this.post("validate-token", {
      body: { token },
    })
  }
}

// 싱글톤 인스턴스 export
const authApi = new AuthApiService()

export default authApi
