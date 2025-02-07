import { Injectable, Logger, NestMiddleware } from "@nestjs/common"
import { JwtService } from "@nestjs/jwt"
import { NextFunction, Request, Response } from "express"
/**
 *- 목적: 보안 관련 이벤트 모니터링
  - 기록 정보:
    - 사용자 인증 정보 (JWT)
    - 비정상적인 접근 시도
    - IP 주소 패턴
    - 인증 실패
  - 로깅 레벨: warn (보안 이슈 발생 시)
 */
@Injectable()
export class SecurityLoggerMiddleware implements NestMiddleware {
  constructor(private readonly jwt: JwtService) {}
  private readonly logger = new Logger(SecurityLoggerMiddleware.name)

  use(req: Request, res: Response, next: NextFunction) {
    const { ip, headers } = req
    const userId = this.extractUserId(headers.authorization)

    if (this.isUnusualActivity(ip!, userId)) {
      this.logger.warn({
        message: "Unusual Activity Detected",
        ip,
        userAgent: req.headers["user-agent"] || "",
        userId,
        timestamp: new Date(),
      })
    }

    next()
  }

  private extractUserId(authHeader?: string): string {
    // JWT 토큰 추출 로직
    return ""
  }

  private isUnusualActivity(ip: string, userId: string): boolean {
    // 비정상 활동 감지 로직
    return false
  }
}
