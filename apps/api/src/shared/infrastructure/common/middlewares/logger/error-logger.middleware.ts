import { Injectable, Logger, NestMiddleware } from "@nestjs/common"

import { NextFunction, Request, Response } from "express"
/**
 *- 목적: 에러 상황 모니터링
  - 기록 정보:
    - 4xx 에러 (클라이언트 에러)
    - 5xx 에러 (서버 에러)
    - 에러 발생 시점
    - 에러 관련 요청 정보
  - 로깅 레벨: 
    - warn (4xx 에러)
    - error (5xx 에러)
 */
@Injectable()
export class ErrorLoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger(ErrorLoggerMiddleware.name)

  use(req: Request, res: Response, next: NextFunction) {
    res.on("finish", () => {
      const { statusCode } = res

      if (statusCode >= 400) {
        this.logger[statusCode >= 500 ? "error" : "warn"]({
          method: req.method,
          path: req.originalUrl,
          statusCode,
          timestamp: new Date().toISOString(),
        })
      }
    })

    next()
  }
}
