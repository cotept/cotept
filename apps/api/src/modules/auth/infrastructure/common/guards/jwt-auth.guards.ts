import { ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common"
import { AuthGuard } from "@nestjs/passport"

import { Request } from "express"

import { ValidateTokenUseCase } from "@/modules/auth/application/ports/in/validate-token.usecase"
import { TokenPayload } from "@/modules/auth/domain/model/token-payload"
import { JwtAuthenticatedUser } from "@/modules/auth/infrastructure/common/strategies/jwt.strategy"

/**
 * JWT 인증 가드
 * HTTP 요청의 Authorization 헤더에서 JWT 토큰을 추출하고 검증합니다.
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {
  constructor(private readonly validateTokenUseCase: ValidateTokenUseCase) {
    super()
  }

  /**
   * 요청 처리 전 인증 검증
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>()
    const token = this.extractTokenFromHeader(request)
    if (!token) {
      throw new UnauthorizedException("인증 토큰이 없습니다.")
    }

    const tokenPayload = await this.validateTokenUseCase.execute({ token })

    if (!tokenPayload) {
      throw new UnauthorizedException("유효하지 않은 토큰입니다.")
    }

    // 요청 객체에 사용자 정보 설정
    request.user = this.transformTokenPayloadToUser(tokenPayload)

    return true
  }

  /**
   * Authorization 헤더에서 토큰 추출
   */
  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(" ") ?? []
    return type === "Bearer" ? token : undefined
  }

  /**
   * 토큰 페이로드를 사용자 정보로 변환
   */
  private transformTokenPayloadToUser(payload: TokenPayload): JwtAuthenticatedUser {
    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
    }
  }
}
