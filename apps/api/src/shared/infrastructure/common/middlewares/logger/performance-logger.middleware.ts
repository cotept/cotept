import { Injectable, Logger, NestMiddleware } from "@nestjs/common"

import { NextFunction, Request, Response } from "express"
/**
 * - 목적: 성능 모니터링 및 느린 요청 감지
  - 기록 정보:
    - 요청 처리 시간 측정
    - 설정된 임계값(예: 3초) 초과 시 경고
    - 요청 메소드와 URL
  - 로깅 레벨: warn (느린 요청 발생 시)
 */
@Injectable()
export class PerformanceLoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger(PerformanceLoggerMiddleware.name)
  private readonly SLOW_REQUEST_THRESHOLD = 3000 // 3초

  use(req: Request, res: Response, next: NextFunction) {
    const requestStart = Date.now()
    const { method, originalUrl } = req

    res.on("finish", () => {
      const processingTime = Date.now() - requestStart

      if (processingTime > this.SLOW_REQUEST_THRESHOLD) {
        this.logger.warn({
          message: "Slow Request Detected",
          method,
          url: originalUrl,
          processingTime: `${processingTime}ms`,
        })
      }
    })

    next()
  }
}
