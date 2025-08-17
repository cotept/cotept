import { MiddlewareConsumer, Module, NestModule, RequestMethod } from "@nestjs/common"

import { ErrorLoggerMiddleware, PerformanceLoggerMiddleware, RequestLoggerMiddleware } from "./logger"

export const MIDDLEWARE_CONFIG = {
  globalMiddlewares: [RequestLoggerMiddleware, ErrorLoggerMiddleware],
  routeSpecific: {
    "/api/*path": [PerformanceLoggerMiddleware],
    // "/auth/*": [SecurityLoggerMiddleware],
    // "/admin/*": [SecurityLoggerMiddleware],
  },
  excludes: [{ path: "/health", method: RequestMethod.GET }],
}

@Module({})
export class LoggerModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // 글로벌 적용
    consumer
      .apply(...MIDDLEWARE_CONFIG.globalMiddlewares)
      .exclude(...MIDDLEWARE_CONFIG.excludes)
      .forRoutes("*")

    // 라우트 별 적용
    Object.entries(MIDDLEWARE_CONFIG.routeSpecific).forEach(([path, middlewares]) => {
      consumer.apply(...middlewares).forRoutes(path)
    })
  }
}
