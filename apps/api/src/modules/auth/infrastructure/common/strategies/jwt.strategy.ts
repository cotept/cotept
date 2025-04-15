import { AuthUserRepositoryPort } from "@/modules/auth/application/ports/out/auth-user-repository.port"
import { TokenPayload } from "@/modules/auth/domain/model/token-payload"
import { Injectable } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { PassportStrategy } from "@nestjs/passport"
import { ExtractJwt, Strategy } from "passport-jwt"

/**
 * JWT 인증으로 확인된 사용자 정보
 */
export interface JwtAuthenticatedUser {
  id: string
  email: string
  role: string
}

/**
 * JWT 전략
 * Passport를 위한 JWT 검증 전략을 구현합니다.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly authUserRepositoryPort: AuthUserRepositoryPort,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>("JWT_SECRET"),
    })
  }

  /**
   * JWT 페이로드 검증 및 사용자 정보 반환
   * @param payload JWT 페이로드
   * @returns 사용자 정보
   */
  async validate(payload: Record<string, any>): Promise<JwtAuthenticatedUser> {
    // TokenPayload 객체로 변환
    const tokenPayload = TokenPayload.fromJwtPayload(payload)

    // 선택적: 토큰의 사용자 ID로 실제 사용자 정보 조회
    // const user = await this.authUserRepositoryPort.findById(tokenPayload.sub)
    // if (!user) {
    //   return null
    // }

    // 인증된 사용자 정보 반환
    return {
      id: tokenPayload.sub,
      email: tokenPayload.email,
      role: tokenPayload.role,
    }
  }
}
