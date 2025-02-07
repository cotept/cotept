import { Injectable, Logger, NestMiddleware } from "@nestjs/common"
import { NextFunction, Request, Response } from "express"
/**
 *- 목적: 기본적인 HTTP 요청/응답 정보 로깅
  - 기록 정보:
    - 요청 메소드 (GET, POST 등)
    - 요청 URL
    - IP 주소
    - User Agent
    - 응답 상태 코드
    - 처리 시간
  - 로깅 레벨: info (기본 요청)
 */
@Injectable()
export class RequestLoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger(RequestLoggerMiddleware.name)

  use(req: Request, res: Response, next: NextFunction) {
    const { ip, method, originalUrl } = req
    const userAgent = req.get("user-agent") || "unknown"
    const requestStart = Date.now()

    this.logger.log(`Incoming Request: [${method}] ${originalUrl} - IP: ${ip}`)

    res.on("finish", () => {
      const { statusCode } = res
      const processingTime = Date.now() - requestStart

      this.logger.log({
        method,
        url: originalUrl,
        statusCode,
        processingTime: `${processingTime}ms`,
        ip,
        userAgent,
      })
    })

    next()
  }
}
