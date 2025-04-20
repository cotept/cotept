import { AuthFacadeService } from "@/modules/auth/application/services/facade/auth-facade.service"
import { Injectable, UnauthorizedException } from "@nestjs/common"
import { PassportStrategy } from "@nestjs/passport"
import { Request } from "express"
import { Strategy } from "passport-local"

/**
 * 로그인 인증 결과 타입
 */
export interface AuthenticatedUser {
  id: string
  email: string
  role: string
}

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authFacadeService: AuthFacadeService) {
    super({
      usernameField: "email",
      passwordField: "password",
      passReqToCallback: true,
    })
  }

  /**
   * passport-local 전략의 검증 메서드
   * @param req Express 요청 객체
   * @param email 사용자 이메일
   * @param password 사용자 비밀번호
   * @returns 인증된 사용자 정보
   */
  async validate(req: Request, email: string, password: string): Promise<AuthenticatedUser> {
    try {
      // 사용자 찾기
      const user = await this.authFacadeService.findUserByEmail(email)
      if (!user) {
        throw new UnauthorizedException("이메일 또는 비밀번호가 올바르지 않습니다.")
      }

      // 비밀번호 검증
      const isValid = await this.authFacadeService.validateCredentials(email, password)
      if (!isValid) {
        throw new UnauthorizedException("이메일 또는 비밀번호가 올바르지 않습니다.")
      }

      // 계정 상태 확인
      if (!user.canLogin()) {
        throw new UnauthorizedException("계정이 활성화되지 않았습니다.")
      }

      // 기본 사용자 정보만 반환
      return {
        id: user.id,
        email: user.email,
        role: user.role,
      }
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error
      }
      // 인증 실패 시 UnauthorizedException 발생
      throw new UnauthorizedException("인증에 실패했습니다.")
    }
  }
}
